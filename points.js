const NUM_POINTS = 1000

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

var sponge = mengerSponge(new THREE.Vector3(0, 0, 0), 1, 4)

var particles = makeParticles(sponge)
// var particles = makeBoxes(sponge)

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.look = new THREE.Vector3(0, 0, -1)
camera.lookAt(camera.look)
camera.position.y = 0.5
camera.position.z = 2

var control = new Control(camera, renderer.domElement)
camera.position.z = 1.5
render()

function render() {
    stats.begin()

    particles.rotation.x += 0.0003
    particles.rotation.y += 0.001

    control.update()
    renderer.render(scene, camera)

    stats.end()
    requestAnimationFrame(render)
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

// 各辺の長さは 1。
function mengerSponge(center, edge_length, depth) {
    if (depth < 1) {
        return [center]

        // var box = new THREE.BoxGeometry(edge_length, edge_length, edge_length, 1, 1, 1)
        // box.translate(center.x, center.y, center.z)
        // return [box]
    }
    --depth

    var new_centers = []
    var new_edge_length = edge_length / 3
    var top = center.y + new_edge_length
    var bottom = center.y - new_edge_length
    var right = center.x + new_edge_length
    var left = center.x - new_edge_length
    var front = center.z + new_edge_length
    var back = center.z - new_edge_length

    new_centers.push(new THREE.Vector3(right, top, front))
    new_centers.push(new THREE.Vector3(right, top, center.z))
    new_centers.push(new THREE.Vector3(right, top, back))
    new_centers.push(new THREE.Vector3(center.x, top, front))
    new_centers.push(new THREE.Vector3(center.x, top, back))
    new_centers.push(new THREE.Vector3(left, top, front))
    new_centers.push(new THREE.Vector3(left, top, center.z))
    new_centers.push(new THREE.Vector3(left, top, back))
    new_centers.push(new THREE.Vector3(right, center.y, front))
    new_centers.push(new THREE.Vector3(right, center.y, back))
    new_centers.push(new THREE.Vector3(left, center.y, front))
    new_centers.push(new THREE.Vector3(left, center.y, back))
    new_centers.push(new THREE.Vector3(right, bottom, front))
    new_centers.push(new THREE.Vector3(right, bottom, center.z))
    new_centers.push(new THREE.Vector3(right, bottom, back))
    new_centers.push(new THREE.Vector3(center.x, bottom, front))
    new_centers.push(new THREE.Vector3(center.x, bottom, back))
    new_centers.push(new THREE.Vector3(left, bottom, front))
    new_centers.push(new THREE.Vector3(left, bottom, center.z))
    new_centers.push(new THREE.Vector3(left, bottom, back))

    var sponge = []
    for (var i = 0; i < new_centers.length; ++i) {
        sponge = sponge.concat(mengerSponge(new_centers[i], new_edge_length, depth))
    }
    return sponge
}

function makeParticles(vertices) {
    var geometry = new THREE.Geometry()
    for (var i = 0; i < vertices.length; ++i) {
        geometry.vertices.push(vertices[i])
    }
    var material = new THREE.PointsMaterial({ size: 0.005, color: 0x00aaff })
    var particles = new THREE.Points(geometry, material)
    scene.add(particles)
    return particles
}

function makeBoxes(boxes) {
    var sponge = new THREE.Object3D()
    var material = new THREE.MeshLambertMaterial({ color: 0x00aaff })
    for (var i = 0; i < boxes.length; ++i) {
        var box = new THREE.Mesh(boxes[i], material)
        sponge.add(box)
    }
    scene.add(sponge)
    return sponge
}

function ramdomColor() {
    var r = Math.floor(Math.random() * 256)
    var g = Math.floor(Math.random() * 256)
    var b = Math.floor(Math.random() * 256)
    return r * 0x10000 + g * 0x100 + b
}
