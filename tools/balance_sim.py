# Lanternhold balance simulation: plays the whole game many times with a simple AI.
# Keep the numbers in E, GROUP and ZONES in sync with ENEMIES.md, then run: python3 tools/balance_sim.py
import random, statistics as st
R=random.Random(1)
E={ # hp atk def xp gold
 'slime':dict(hp=12,atk=6,df=1,xp=6,sp='absorb'),
 'wolf': dict(hp=20,atk=8,df=2,xp=12,sp='pounce'),
 'boar': dict(hp=70,atk=10,df=4,xp=60,sp='charge',boss=1),
 'bat':  dict(hp=22,atk=14,df=3,xp=15,sp='drain'),
 'beetle':dict(hp=40,atk=13,df=10,xp=22,sp='harden'),
 'crawler':dict(hp=190,atk=20,df=8,xp=150,sp='web',boss=1),
 'shade':dict(hp=40,atk=20,df=6,xp=30,sp='fade'),
 'knight':dict(hp=65,atk=22,df=14,xp=40,sp='swing'),
 'king':dict(hp=200,atk=22,df=12,xp=0,sp='king',boss=1),
}
GROUP={'slime':(1,2),'wolf':(1,1),'bat':(2,2),'beetle':(1,1),'shade':(1,2),'knight':(1,1)}
def stats(p):
    L=p['lv']; return dict(maxhp=30+8*(L-1), atk=5+2*(L-1)+p['wpn'], df=2+(L-1)+p['arm'], maxlight=5+(L-1)+2*p['shr'])
def gain(p,xp):
    p['xp']+=xp; ups=0
    while p['lv']<10 and p['xp']>=10*p['lv']*(p['lv']+1):
        p['lv']+=1; ups+=1
    if ups:
        s=stats(p); p['hp']=s['maxhp']; p['light']=s['maxlight']
def dmg(a,d): return max(1,a-d+R.randint(-2,2))
def fight(p,names):
    es=[dict(E[n],n=n,t=0,cur=E[n]['hp'],hard=0,tel=0) for n in names]
    s=stats(p); turns=0; phase2=False
    while True:
        turns+=1
        if turns>80: return 'stall',turns
        live=[e for e in es if e['cur']>0]
        if not live: return 'win',turns
        s=stats(p)
        if p.get('skip'): p['skip']=0
        else:
            tgt=live[0]
            if p['hp']<0.4*s['maxhp'] and p['light']>=3:
                p['light']-=3; p['hp']=min(s['maxhp'],p['hp']+int(0.3*s['maxhp']))
            elif p['hp']<0.3*s['maxhp'] and p['items']>0:
                p['items']-=1; p['hp']=min(s['maxhp'],p['hp']+p['heal'])
            elif p['radiance'] and len(live)>1 and p['light']>=5:
                p['light']-=5
                for e in live: e['cur']-=dmg(s['atk'],e['df']+(5 if e['hard'] else 0))
            elif p['light']>=2 and (tgt['sp'] in('fade',) or tgt.get('boss')) and p['hp']>0.5*s['maxhp']:
                p['light']-=2; tgt['cur']-=int(1.5*dmg(s['atk'],tgt['df']+(5 if tgt['hard'] else 0)))
            else:
                d=dmg(s['atk'],tgt['df']+(5 if tgt['hard'] else 0))
                if tgt['sp']=='fade': d=max(1,d//2)
                tgt['cur']-=d
        for e in es:
            if e['cur']<=0: continue
            e['t']+=1; e['hard']=max(0,e['hard']-1); sp=e['sp']; mult=1; atk=e['atk']
            if sp=='king' and not phase2 and e['cur']<=e['hp']//2:
                phase2=True; es+= [dict(E['shade'],n='shade',t=0,cur=40,hard=0,tel=0) for _ in range(2)]; continue
            if sp=='king' and phase2: atk=25
            if sp=='absorb' and R.random()<.2: e['cur']=min(e['hp'],e['cur']+3); continue
            if sp=='pounce' and R.random()<.25: mult=1.5
            if sp in('charge','swing') :
                period=3
                if e['t']%period==2: continue  # telegraph turn
                if e['t']%period==0: mult=2 if sp=='charge' else 1.5
            if sp=='king' and phase2 and e['t']%3==0: mult=2
            if sp=='king' and e['t']%4==1: p['light']=max(0,p['light']-3)
            if sp=='drain' and R.random()<.3: p['light']=max(0,p['light']-2)
            if sp=='harden' and e['t']%4==1: e['hard']=2; continue
            if sp=='web' and e['t']%4==0: p['skip']=1; continue
            p['hp']-=int(mult*dmg(atk,s['df']))
            if p['hp']<=0: return 'dead',turns
ZONES=[ # enemies on map, boss, gear on entering, items carried, item heal
 ('mosswood',['slime']*6+['wolf']*2,'boar',dict(wpn=2,arm=1),4,20),
 ('caves',['bat']*5+['beetle']*3,'crawler',dict(wpn=5,arm=3),4,50),
 ('spire',['shade']*4+['knight']*4+['shade'],'king',dict(wpn=9,arm=6),5,50),
]
def run(clears=(1,1,1)):
    p=dict(lv=1,xp=0,shr=0,skip=0,radiance=False); s=stats(dict(p,wpn=2,arm=1)); p.update(hp=s['maxhp'],light=s['maxlight'])
    log=[]
    for zi,(z,mobs,boss,gear,items,heal) in enumerate(ZONES):
        p.update(gear); p['items']=items; p['heal']=heal
        s=stats(p); p['hp']=s['maxhp']; p['light']=s['maxlight']  # rest in village before each zone
        startlv=p['lv']; hplow=1; fights=0
        for c in range(clears[zi]):
            for m in mobs:
                lo,hi=GROUP[m]; g=[m]*R.randint(lo,hi)
                r,t=fight(p,g); fights+=1
                if r!='win': return log+[(z,'DIED vs '+m,p['lv'])]
                gain(p,sum(E[x]['xp'] for x in g)); hplow=min(hplow,p['hp']/stats(p)['maxhp'])
            if c<clears[zi]-1: s=stats(p); p['hp']=s['maxhp']; p['light']=s['maxlight']
        bosslv=p['lv']; s=stats(p); p['hp']=s['maxhp']; p['light']=s['maxlight']
        r,t=fight(p,[boss])
        if r!='win': return log+[(z,'DIED vs '+boss+f' at lv{bosslv} hp{p["hp"]}',bosslv)]
        gain(p,E[boss]['xp']); p['shr']+=1
        if p['shr']==2: p['radiance']=True
        log.append((z,f'lv {startlv}->{bosslv} at boss, boss turns {t}, lowest hp {hplow:.0%}',p['lv']))
    return log
for clears in [(1,1,1),(2,1,1),(1,2,1),(2,2,1),(2,2,2)]:
    res=[run(clears) for _ in range(300)]
    deaths={}
    for r in res:
        last=r[-1][1]
        if 'DIED' in last: k=r[-1][0]+' '+last.split(' at')[0]; deaths[k]=deaths.get(k,0)+1
    wins=sum(1 for r in res if len(r)==3 and 'DIED' not in r[-1][1])
    print(clears,'finish rate',wins/len(res),'deaths',deaths)
    print('  sample',[x[1] for x in res[0]])
