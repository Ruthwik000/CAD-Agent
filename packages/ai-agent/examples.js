// Example JSCAD scripts for reference

// Simple Car Example
const carExample = `
const { cuboid, cylinder } = require('@jscad/modeling').primitives
const { translate } = require('@jscad/modeling').transforms
const { union } = require('@jscad/modeling').booleans

const main = () => {
  // Car body
  const body = cuboid({ size: [60, 30, 15], center: [0, 0, 7.5] })
  
  // Car cabin
  const cabin = cuboid({ size: [30, 28, 15], center: [0, 0, 22.5] })
  
  // Wheels
  const wheel1 = translate([20, 18, 8], cylinder({ radius: 8, height: 4, center: [0, 0, 0] }))
  const wheel2 = translate([20, -18, 8], cylinder({ radius: 8, height: 4, center: [0, 0, 0] }))
  const wheel3 = translate([-20, 18, 8], cylinder({ radius: 8, height: 4, center: [0, 0, 0] }))
  const wheel4 = translate([-20, -18, 8], cylinder({ radius: 8, height: 4, center: [0, 0, 0] }))
  
  return union(body, cabin, wheel1, wheel2, wheel3, wheel4)
}

module.exports = { main }
`

// House Example
const houseExample = `
const { cuboid, cylinder } = require('@jscad/modeling').primitives
const { translate, rotate } = require('@jscad/modeling').transforms
const { union, subtract } = require('@jscad/modeling').booleans

const main = () => {
  // Walls
  const walls = cuboid({ size: [50, 40, 30], center: [0, 0, 15] })
  
  // Door cutout
  const door = translate([0, -20, 10], cuboid({ size: [10, 5, 20], center: [0, 0, 0] }))
  
  // Roof
  const roof = translate([0, 0, 30], 
    rotate([Math.PI / 2, 0, 0], 
      cylinder({ radius: 30, height: 40, segments: 4 })
    )
  )
  
  return union(subtract(walls, door), roof)
}

module.exports = { main }
`

// Coffee Mug Example
const mugExample = `
const { cylinder } = require('@jscad/modeling').primitives
const { translate } = require('@jscad/modeling').transforms
const { subtract, union } = require('@jscad/modeling').booleans
const { extrudeLinear } = require('@jscad/modeling').extrusions
const { circle } = require('@jscad/modeling').primitives

const main = () => {
  // Outer cylinder
  const outer = cylinder({ radius: 15, height: 30, center: [0, 0, 15] })
  
  // Inner cylinder (hollow part)
  const inner = translate([0, 0, 2], cylinder({ radius: 13, height: 30, center: [0, 0, 15] }))
  
  // Handle
  const handleProfile = circle({ radius: 2, center: [20, 15] })
  const handle = extrudeLinear({ height: 15 }, handleProfile)
  
  return union(subtract(outer, inner), translate([0, 0, 7.5], handle))
}

module.exports = { main }
`

module.exports = {
  carExample,
  houseExample,
  mugExample
}
