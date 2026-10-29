# Lanternhold: Story and Dialogue

This file has the full story outline, the cast, every scripted scene, NPC dialogue for each point in the story, quest log text, and the system messages. **Tone:** warm, with light humor. The village is cozy and a little silly, but the dark is real. **Twist:** the Hollow King is Lanternhold's first lamplighter, and you free him rather than destroy him.

Map locations come from [MAPS.md](MAPS.md), boss fights from [ENEMIES.md](ENEMIES.md), and rewards from [ITEMS.md](ITEMS.md).

---

## 1. Story in one paragraph

A hundred years ago, **Corvin Ashe**, Lanternhold's first lamplighter, built the great lantern and the three shrines that feed it. He was afraid of the dark his whole life. When he grew old, he climbed the Ashen Spire to keep the light safe forever, and he took it for himself. The hoarded light hollowed him out until he became **the Hollow King**, and now he is pulling the last of the valley's light up into his tower. You are **Pip**, apprentice to the current lamplighter, Old Wick. You carry the *Lamplighter's Staff*, which belonged to Corvin, though nobody remembers that. You relight each shrine. At each one you find part of Corvin's story carved into the stone. At the top of the Spire you break his crown, give the light back, and the frightened old man asks for one thing: to keep the dark away instead of hiding from it. His flame becomes the village lantern's light.

---

## 2. Cast and voices

| Character | Role | Voice | Sample line |
|---|---|---|---|
| **Pip** (player) | Apprentice lamplighter | Silent. Their actions do the talking. | — |
| **Old Wick** | Lamplighter, gives the main quests | Gruff, but obviously fond of Pip. Makes terrible candle puns and refuses to admit they're puns. | *"Don't look at me like that. Wick is a perfectly normal name."* |
| **Bren** | Shopkeeper | A cheerful salesperson who turns every crisis into a sales pitch. | *"End of the world? Then you'll want Herbs. Bulk discount!"* |
| **Tamsin** | Farmer, gives *Lost Locket* | A nervous worrier. She talks to her goat, Duchess, more than to people. | *"Duchess thinks I'm overreacting. Duchess eats fences."* |
| **The Hollow King / Corvin Ashe** | Final boss | Cold and grand while he's the King. Small and scared once he's Corvin again. | *"Every light goes out, little lamplighter. I simply got there first."* |

**Pip's name:** the name is fixed as "Pip" in version 1, so you don't need a name-entry screen. Letting players choose a name can go on the README's "Someday" list.

---

## 3. Story beats and flags

Each beat sets a flag in `world.flags`. Dialogue and quests check these flags.

| # | Beat | Where | Sets flag |
|---|---|---|---|
| 0 | **Opening:** the lantern flickers, and Wick gives you the staff | Village (plays when a new game starts) | `introDone` |
| 1 | Defeat the Thornback Boar and relight Shrine 1 | Mosswood | `shrine1Lit` |
| 2 | Back in the village, the lantern brightens and the north fog burns away | Village | (set by flag 1) |
| 3 | Defeat the Pale Crawler and relight Shrine 2 | Gloam Caves | `shrine2Lit` |
| 4 | The west fog burns away | Village | (set by flag 3) |
| 5 | Climb the Spire. A warning plays before the boss | Spire Floor 2 | `kingMet` |
| 6 | Defeat the Hollow King, free Corvin, and relight Shrine 3 | Spire Floor 2 | `kingDefeated`, `shrine3Lit` |
| 7 | **Ending:** Corvin's flame lights the village lantern, then the credits | Village (cutscene) | `gameComplete` |

**Seeding the twist:** each shrine carving reveals part of Corvin's story, so the reveal at the end feels earned rather than random.

| Where | Clue |
|---|---|
| Opening | Wick says the staff is "older than the village," and nobody knows who made it. |
| Shrine 1 carving | "C.A. lit the first flame here, so the forest need never fear the night." |
| Shrine 2 carving | "C.A. lit the second flame and could not sleep. What if they all go out?" |
| Spire Floor 1 | A faded painting on the wall shows a man holding *your staff*. |
| Hollow King, before the fight | "That staff… I know that staff." |

---

## 4. Scripted scenes

Each scene is a list of `{ speaker, text }` boxes. **Space** goes to the next box. Lines in *italics* are narration, with no speaker name shown.

### Opening: "The Flicker" (new game, village square)
1. *Night. The great lantern sputters, and shadows creep across the square.*
2. **Wick:** Pip! Up, up. The lantern's been coughing all evening.
3. **Wick:** That's not a figure of speech. Listen. *(The lantern coughs.)*
4. **Wick:** The three shrine flames feed it, and someone's been stealing them. Shades on the roads, too.
5. **Wick:** I'm too old to go tramping through forests. You're not. Take this.
6. *Wick hands you the Lamplighter's Staff. It's warm, as if someone was just holding it.*
7. **Wick:** That staff's older than the village. Nobody knows who made it. Try not to lose it.
8. **Wick:** Start with the Mosswood shrine, east of here. And see Bren before you go. Bring gold. Bren always wants gold.

→ Sets `introDone`. Gives Quest 1 (*Relight the Mosswood Shrine*), and play begins.

### Mini-boss: Thornback Boar (bump into it)
1. *A boar the size of a cart blocks the clearing. Thorns grow straight out of its back.*
2. *It snorts. It does not seem interested in talking.*

### Shrine 1 relit (interact with the shrine after the Boar)
1. *You touch the staff to the cold stone. The flame catches, green-gold, like sunlight through leaves.*
2. *Words are carved into the base:* "C.A. lit the first flame here, so the forest need never fear the night."
3. *Far to the west, the village lantern glows a little brighter.*
4. *Light restored. Max Light +2. The shrine is now a rest point.*

### Mini-boss: The Pale Crawler (bump into it)
1. *Something white and many-legged unfolds from the ceiling.*
2. *Strands of web glitter in your light. It has been waiting a long time for something warm.*

### Shrine 2 relit
1. *The second flame burns blue and steady, and the cave walls sparkle.*
2. *The carving here is shakier:* "C.A. lit the second flame and could not sleep. What if they all go out?"
3. *The staff hums. You feel the light gather in it. You learned **Radiance**!*
4. *Light restored. Max Light +2.*

### Spire Floor 1: the painting (interact with the wall at (10, 2))
1. *A faded portrait: a thin man in a lamplighter's coat. He's holding a staff.*
2. *Your staff. The same notch near the top.*
3. *The brass plate reads: "Corvin Ashe, Keeper of the Light."*

To make this work, add the painting as an interactable on the wall tile at (10, 2), just below the stair landing. You can read it from (10, 1) or (11, 2). In MAPS.md this is a plain `#` tile, so each map gets a small `signs` list: `{ x, y, scene }`.

### Before the Hollow King (bump into him)
1. *The air grows cold. Every candle in the room leans toward the throne.*
2. **Hollow King:** Another lamplighter. They always send a lamplighter.
3. **Hollow King:** That staff… I know that staff.
4. **Hollow King:** Every light goes out, little lamplighter. I simply got there first.
5. *The air grows cold. Continue?* **[Yes] / [Not yet]**

→ Sets `kingMet`. Choosing *Not yet* steps you back one tile. Next time, the scene skips straight to box 5.

### Phase 2 starts (King drops to 50% HP)
1. **Hollow King:** No. NO. It's *mine*. If I let go, it all goes dark!
2. *Darkness pours from his crown.*

### After the fight: "Corvin"
1. *The crown cracks. Light floods the spire.*
2. *Where the King stood, there's only a thin old man in a lamplighter's coat, shivering.*
3. **Corvin:** I was so afraid of the dark. I thought if I held all the light, I'd never be afraid again.
4. **Corvin:** It turns out that if you hold all the light, everyone else is in the dark. Seems obvious now.
5. **Corvin:** You carry my staff well. Better than I did.
6. **Corvin:** Would you take me home? I'd like to keep the dark away, for once. Instead of hiding from it.
7. *You relight the final shrine. Corvin's light drifts into the flame.*

→ Sets `kingDefeated` and `shrine3Lit`, then fades to the ending.

### Ending: "Lanternhold" (village square)
1. *Morning. The great lantern is burning brighter than anyone can remember.*
2. **Wick:** Well. You did it. And you brought back… is that *Corvin Ashe*? In the lantern?
3. **Wick:** I always said that lantern had a personality.
4. **Bren:** A hero's return! Commemorative Herbs, half price. Today only.
5. **Tamsin:** Duchess says thank you. Duchess also ate the bunting.
6. **Wick:** Get some sleep, lamplighter. *Lamplighter.* Not apprentice. Has a ring to it.
7. *THE END*

→ Sets `gameComplete`, then shows the credits.

---

## 5. NPC dialogue by state

The game uses **the first entry whose condition matches.** Each conversation is 1–3 boxes.

### Old Wick `W`
| When | Lines |
|---|---|
| `shrine2Lit` | "Two flames lit. The Spire's open, west road. Whatever's up there, it's been waiting for you." / "Take Tonics. Take Elixirs. Take a nap first, honestly." |
| `shrine1Lit` | "Look at that lantern! Brighter already. Burned the fog right off the north road." / "The second shrine's in the Gloam Caves. It's dark down there. You'll be fine. Probably." |
| `introDone` | "Mosswood's east. Shrine's past the river, on the far side. Mind the boar." / "No, I don't know which boar. There's always a boar." |

When you talk to Wick while a main quest is active and its shrine is lit, he turns in the quest and gives you the next one.

### Bren `B`
| When | Lines |
|---|---|
| Pest Control `active` and kills ≥ 5 | "Five slimes! The shop smells *so* much less like slime. Here, a vest, on the house. And friend prices, forever!" → turn in the quest |
| Pest Control `active` | "Slimes keep oozing into my stockroom. That's {count}/5 so far. Keep going!" |
| Pest Control `locked` | "Before you go… slimes keep getting into my stock. Squash five in the Mosswood and I'll make it worth your while." → start the quest |
| New stock just unlocked | "Fresh from the cave road: Tonics!" or "Elixirs, straight from… don't ask where. Very rare." |
| Otherwise | "Welcome to Bren's! If it's not on the shelf, you didn't need it." then the shop opens |

### Tamsin `T`
| When | Lines |
|---|---|
| Lost Locket `done` | "My locket's right here where it belongs. Duchess is jealous." |
| You have the Locket | "My locket! You found it! Oh, I could cry. Duchess, don't eat it." → turn in the quest (3 Tonics + 50 gold) |
| Lost Locket `active` | "It's silver, with a little lantern on the front. I dropped it running from a bat in the caves." / "Don't ask why I was in the caves. Duchess wandered off." |
| `shrine1Lit` (quest `locked`) | "You're going into the caves? Could you look for my locket? I lost it when the fog first came." → start the quest |
| Otherwise | "Duchess thinks I'm overreacting about the dark. Duchess eats fences." |

### The lantern `L` (hint system)
| When | Text |
|---|---|
| `shrine3Lit` | *The lantern hums contentedly. If you didn't know better, you'd say it was smiling.* |
| `shrine2Lit` | *Bright and steady. The west fog is gone. The Spire waits.* |
| `shrine1Lit` | *Brighter now. The north fog has burned away. The caves are open.* |
| Otherwise | *The great lantern flickers weakly. East, past the gate, is Mosswood.* |

---

## 6. Quest log text

| Quest | While active | When done |
|---|---|---|
| **Relight the Mosswood Shrine** | The shrine lies past the river in the Mosswood, east of the village. Something large guards it. | The forest flame burns again. |
| **Relight the Gloam Shrine** | The north fog has lifted. Find the shrine deep in the Gloam Caves. | The cave flame burns blue. |
| **Relight the Spire Shrine** | The west road is clear. Climb the Ashen Spire and face whatever is stealing the light. | Corvin is home. |
| **Pest Control** | Defeat Moss Slimes for Bren: {count}/5. | Bren's stockroom is slime-free. Friend prices unlocked! |
| **Lost Locket** | Find Tamsin's silver locket somewhere in the Gloam Caves. | Returned to Tamsin. Duchess is jealous. |

---

## 7. System messages

| Situation | Text |
|---|---|
| Bump into fog | *A wall of shade fog. The lantern isn't bright enough to burn it away yet.* |
| Open a chest | *You found {item}!* (or *You found {gold} gold!*) |
| Open an empty chest | *Empty. You already got this one.* |
| Pack full | *Your pack is full. Sold for {gold} gold.* |
| Rest at a lit shrine | *The flame warms you. HP and Light restored.* |
| Level up | *Pip reached level {n}!* followed by the stat increases |
| Battle won | *Victory! {xp} XP, {gold} gold.* |
| Battle lost | *Everything goes dark…* then *You wake up in the village. Wick is frowning. Half your gold is gone.* |
| Flee succeeds / fails | *You got away!* / *Couldn't escape!* |
| Flee from a boss | *There's no running from this one.* |
| Game saved | *Saved.* (shown briefly in a corner of the screen) |

---

## 8. Credits

```
LANTERNHOLD

Design & Code ........ Ursala Lindsey
Art .................. Kenney (kenney.nl), CC0
Font ................. Press Start 2P
Built with ........... React + Vite

Thanks for playing.
The light stays on.
```

---

## 9. Data format

```js
// src/data/dialogue.js
export const NPC_DIALOGUE = {
  tamsin: [
    { when: { quest: ['lostLocket', 'done'] },
      lines: ['My locket\'s right here where it belongs. Duchess is jealous.'] },
    { when: { hasItem: 'locket' },
      lines: ['My locket! You found it! Oh, I could cry. Duchess, don\'t eat it.'],
      action: { completeQuest: 'lostLocket' } },
    { when: { quest: ['lostLocket', 'active'] },
      lines: ['It\'s silver, with a little lantern on the front. I dropped it running from a bat in the caves.'] },
    { when: { flag: 'shrine1Lit' },
      lines: ['You\'re going into the caves? Could you look for my locket? I lost it when the fog first came.'],
      action: { startQuest: 'lostLocket' } },
    { lines: ['Duchess thinks I\'m overreacting about the dark. Duchess eats fences.'] }, // fallback
  ],
  // wick, bren, lantern...
};

// src/data/scenes.js
export const SCENES = {
  opening: [
    { text: 'Night. The great lantern sputters, and shadows creep across the square.' },
    { speaker: 'Wick', text: 'Pip! Up, up. The lantern\'s been coughing all evening.' },
    // ...
  ],
};
```

- **`pickDialogue(npcId, state)`** returns the first entry whose `when` matches. It's a pure function, so it's easy to unit-test: for example, Tamsin with the locket in your inventory should return the turn-in line.
- **Placeholders** like `{count}` and `{item}` get filled in by a tiny `fillText(text, values)` helper.
- **Writing rules:** keep each box to about 80 characters so it fits in two lines of the dialogue box. Use no more than 3 boxes per NPC conversation, and save the longer scenes for story moments.

---

## 10. Build checklist

- **M2:** `DialogueBox`, `pickDialogue`, and the fallback line for each NPC, plus the opening scene.
- **M6:** quest dialogue for Bren and Tamsin, quest log text, and turn-ins.
- **M7:** the mini-boss and shrine scenes, the painting sign, the King's scenes, and the ending.
- **M8:** system messages, credits, and a typo pass. Read every line out loud once.
