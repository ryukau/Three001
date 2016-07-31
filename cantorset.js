//
// stats
//
var stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

//
// three
//
var scene = new THREE.Scene()

var renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

addLights()

var geometry = new THREE.Geometry()
var tree_depth = 8
var length = 1
var tick_height = length / tree_depth
cantor2D(new THREE.Vector3(0, -length, 0), length, tree_depth)
function cantor2D(center, edge_length, depth) {
  if (depth < 1) {
    return
  }
  --depth

  var new_centers = []
    , new_edge_length = edge_length / 3
    , new_z = -edge_length / 3
    , right = center.x + new_edge_length
    , left = center.x - new_edge_length
    , front = center.z + new_edge_length
    , back = center.z - new_edge_length

  new_centers.push(new THREE.Vector3(right, new_z, front))
  new_centers.push(new THREE.Vector3(right, new_z, back))
  new_centers.push(new THREE.Vector3(left, new_z, front))
  new_centers.push(new THREE.Vector3(left, new_z, back))

  for (var i = 0; i < new_centers.length; ++i) {
    geometry.vertices.push(center, new_centers[i])
    cantor2D(new_centers[i], new_edge_length, depth)
  }
}
var material = new THREE.LineBasicMaterial({
  color: 0x00aaff,//ramdomColor(),
  opacity: 1,
  linewidth: 0.1,
})
var tree = new THREE.LineSegments(geometry, material)
scene.add(tree)

var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1e10)
// var camera = new THREE.OrthographicCamera(-10, 10, 100, -10, 1, 1000)
camera.look = new THREE.Vector3(0, -0.4, -1)
camera.lookAt(new THREE.Vector3(0, -0.4, -1))
camera.position.y = 0.5
camera.position.z = 2

var control = new Control(camera, renderer.domElement)

animate()

function animate() {
  stats.begin()

  tree.rotation.y += 0.00003

  control.update()
  renderer.render(scene, camera)

  stats.end()
  requestAnimationFrame(animate)
}

function addLights() {
  var ambient_light = new THREE.AmbientLight(0x404040)
  scene.add(ambient_light)

  var directional_light = new THREE.DirectionalLight(0xffffff, 0.8)
  directional_light.position.set(0, 1, 0)
  scene.add(directional_light)

  var point_light_1 = new THREE.PointLight(0xffffff, 1, 300)
  point_light_1.position.set(-100, 10, 100)
  scene.add(point_light_1)
  var point_light_2 = new THREE.PointLight(0xffffff, 1, 300)
  point_light_2.position.set(100, 10, 100)
  scene.add(point_light_2)
  var point_light_3 = new THREE.PointLight(0xffffff, 1, 300)
  point_light_3.position.set(0, 10, -100)
  scene.add(point_light_3)
}

function ramdomColor() {
  var r = Math.floor(Math.random() * 256)
  var g = Math.floor(Math.random() * 256)
  var b = Math.floor(Math.random() * 256)
  return r * 0x10000 + g * 0x100 + b
}

// http://stackoverflow.com/questions/2913215/fastest-method-to-define-whether-a-number-is-a-triangular-number
function triangleNumber(n) {
  return (Math.sqrt(8 * n + 1) - 1) / 2
}
