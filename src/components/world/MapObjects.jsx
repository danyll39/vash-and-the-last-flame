import { objectSprite } from '../../data/tilesets.js'
import { isObjectGone, objectKey } from '../../logic/world.js'
import Sprite from './Sprite.jsx'
import styles from './World.module.css'

function MapObjects({ map, world }) {
  return map.objects.map((obj) => {
    if (isObjectGone(world, map, obj)) return null

    const opened =
      obj.type === 'chest' &&
      world.openedChests.includes(objectKey(map.id, obj.x, obj.y))
    const sprite = objectSprite(obj, { mapId: map.id, opened })
    if (!sprite) return null

    return (
      <div
        key={`${obj.type}-${obj.x},${obj.y}`}
        className={styles.entity}
        style={{ '--x': obj.x, '--y': obj.y }}
        data-object={obj.type}
        data-opened={opened || undefined}
      >
        <Sprite name={sprite} />
      </div>
    )
  })
}

export default MapObjects
