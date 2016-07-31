class ControlElement {
  constructor(key) {
    this.isActive = false
    this.key = new Set(key)
  }

  addKey(key) {
    this.key.push(key)
  }

  removeKey(key) {
    this.key.delete(key)
  }

  activate(key) {
    if (this.key.has(key)) {
      this.isActive = true
    }
  }

  inactivate(key) {
    if (this.key.has(key)) {
      this.isActive = false
    }
  }
}

class Control {
  constructor(camera, canvas) {
    this.camera = camera
    this.canvas = canvas

    this.camera.up.normalize()
    this.camera.look.normalize()

    this.canvas.tabIndex = 1 // keydown を有効にするためフォーカスできるように設定。
    this.canvas.addEventListener("load", this, false)
    this.canvas.addEventListener("mousedown", this, false)
    this.canvas.addEventListener("mousemove", this, false)
    this.canvas.addEventListener("mouseup", this, false)
    this.canvas.addEventListener("mouseout", this, false)
    this.canvas.addEventListener("keydown", this, false)
    this.canvas.addEventListener("keyup", this, false)
    window.addEventListener("visibilitychange", this, false)

    this.enableContextMenu = true
    this.contextMenu = this.canvas.oncontextmenu

    this.actionSet = [
      this.moveForward = new ControlElement(["w", "W", "ArrowUp"]),
      this.moveBackward = new ControlElement(["s", "S", "ArrowDown"]),
      this.strafeLeft = new ControlElement(["a", "A", "ArrowLeft"]),
      this.strafeRight = new ControlElement(["d", "D", "ArrowRight"]),
      this.moveUp = new ControlElement([" "]),
      this.moveDown = new ControlElement(["Control", "Shift"]),
      this.pitchUp = new ControlElement(["i", "I"]),
      this.pitchDown = new ControlElement(["k", "K"]),
      this.yawLeft = new ControlElement(["j", "J"]),
      this.yawRight = new ControlElement(["l", "L"]),
      this.rollLeft = new ControlElement(["u", "U"]),
      this.rollRight = new ControlElement(["o", "O"])
    ]

    this.isMouseLeftDown = false
    this.isMouseRightDown = false
    this.currentMousePosition = new THREE.Vector2()
    this.previousMousePosition = new THREE.Vector2()
    this.deltaMousePosition = new THREE.Vector2()

    this.moveSpeed = 0.01
    this.rotationSpeed = 0.01
    this.mouseSensitivity = 0.005
  }

  handleEvent(event) {
    switch (event.type) {
      case "load":
        this.onLoad(event)
        break
      case "mousedown":
        this.onMouseDown(event)
        break
      case "mousemove":
        this.onMouseMove(event)
        break
      case "mouseup":
        this.onMouseUp(event)
        break
      case "mouseout":
        this.onMouseOut(event)
        break
      case "keydown":
        this.onKeyDown(event)
        break
      case "keyup":
        this.onKeyUp(event)
        break
      case "visibilitychange":
        this.neutralize()
        break
    }
  }

  onLoad(event) {
    this.isMouseLeftDown = false
    this.isMouseRightDown = false
  }

  mousePosition(event) {
    var rect = event.target.getBoundingClientRect()
    var x = event.clientX - rect.left
    var y = event.clientY - rect.top
    return new THREE.Vector2(x, y)
  }

  onMouseDown(event) {
    if (event.button === 0) {
      this.isMouseLeftDown = true
    }
    if (event.button === 2) {
      this.isMouseRightDown = true
    }

    this.previousMousePosition = this.mousePosition(event)
    this.currentMousePosition.copy(this.previousMousePosition)
    this.deltaMousePosition.set(0, 0)
  }

  onMouseMove(event) {
    // マウスボタンが押下されていなければ処理しない。
    if ((!this.isMouseLeftDown || isNaN(this.isMouseLeftDown))
      && (!this.isMouseRightDown || isNaN(this.isMouseRightDown))) {
      return
    }

    this.previousMousePosition.copy(this.currentMousePosition)
    this.currentMousePosition = this.mousePosition(event)

    this.deltaMousePosition.copy(this.currentMousePosition)
    this.deltaMousePosition.sub(this.previousMousePosition)
  }

  onMouseUp(event) {
    if (event.button === 0) {
      this.isMouseLeftDown = false
    }
    if (event.button === 2) {
      this.isMouseRightDown = false
    }
  }

  onMouseOut(event) {
    this.isMouseLeftDown = false
    this.isMouseRightDown = false
  }

  onKeyDown(event) {
    // console.log(event) // debug

    // event.preventDefault() // ブラウザのショートカットキーを無効化。
    // chrome v52 では ctrl + w/t/n を無効化できない。

    if (event.key === "Escape") { // パニックボタン。
      this.neutralize()
      this.reset()
    }

    if (event.key === "\\") { // 右クリックメニューの有効・無効をトグル。
      this.toggleRightClickMenu()
    }

    for (var i = 0; i < this.actionSet.length; ++i) {
      this.actionSet[i].activate(event.key)
    }
  }

  onKeyUp(event) {
    for (var i = 0; i < this.actionSet.length; ++i) {
      this.actionSet[i].inactivate(event.key)
    }
  }

  update(deltaTime) {
    // 回転。
    var rotationVector = new THREE.Vector3(0, 0, 0)

    if (this.pitchUp.isActive) {
      rotationVector.y += this.rotationSpeed
    }
    if (this.pitchDown.isActive) {
      rotationVector.y -= this.rotationSpeed
    }
    if (this.yawLeft.isActive) {
      rotationVector.x += this.rotationSpeed
    }
    if (this.yawRight.isActive) {
      rotationVector.x -= this.rotationSpeed
    }
    if (this.rollLeft.isActive) {
      rotationVector.z -= this.rotationSpeed
    }
    if (this.rollRight.isActive) {
      rotationVector.z += this.rotationSpeed
    }

    if (this.isMouseLeftDown) {
      rotationVector.x -= this.mouseSensitivity * this.deltaMousePosition.x
      rotationVector.y -= this.mouseSensitivity * this.deltaMousePosition.y
    }
    if (this.isMouseRightDown) {
      rotationVector.z -= 4 * this.mouseSensitivity * this.deltaMousePosition.x
      rotationVector.y -= this.mouseSensitivity * this.deltaMousePosition.y
    }
    this.deltaMousePosition.multiplyScalar(0.1) // マウスを動かしていないときは減速する。

    this.rotateCamera(rotationVector)

    // 移動。
    var moveVector = new THREE.Vector3(0, 0, 0)

    if (this.moveForward.isActive) {
      moveVector.z += 1
    }
    if (this.moveBackward.isActive) {
      moveVector.z -= 1
    }
    if (this.strafeLeft.isActive) {
      moveVector.x -= 1
    }
    if (this.strafeRight.isActive) {
      moveVector.x += 1
    }
    if (this.moveUp.isActive) {
      moveVector.y += 1
    }
    if (this.moveDown.isActive) {
      moveVector.y -= 1
    }
    this.moveCamera(moveVector)
  }

  cameraSideVector() {
    var sideVector = new THREE.Vector3()
    sideVector.crossVectors(this.camera.look, this.camera.up)
    return sideVector.normalize()
  }

  // カメラの向きに速度ベクトルを合わせる。
  moveCamera(moveVector) {
    moveVector.multiplyScalar(this.moveSpeed / moveVector.length())
    var sideVector = this.cameraSideVector()
    var velocity = new THREE.Vector3()
    var axis = new THREE.Vector3()
    velocity.add(axis.copy(sideVector).multiplyScalar(moveVector.x))
    velocity.add(axis.copy(this.camera.up).multiplyScalar(moveVector.y))
    velocity.add(axis.copy(this.camera.look).multiplyScalar(moveVector.z))
    this.camera.position.add(velocity)
  }

  rotateCamera(rotationVector) {
    var sideVector = this.cameraSideVector()

    // pitch
    this.camera.look.applyAxisAngle(sideVector, rotationVector.y)
    this.camera.up.applyAxisAngle(sideVector, rotationVector.y)

    // yaw
    this.camera.look.applyAxisAngle(this.camera.up, rotationVector.x)

    // roll
    this.camera.up.applyAxisAngle(this.camera.look, rotationVector.z)

    var look = this.camera.look.clone()
    look.add(this.camera.position)
    this.camera.lookAt(look)
  }

  neutralize() {
    for (var i = 0; i < this.actionSet.length; ++i) {
      this.actionSet[i].isActive = false
    }
  }

  reset() {
    this.camera.position.set(0, 0, 1)
    this.camera.up.set(0, 1, 0)
    this.camera.look.set(0, 0, -1)
    this.camera.lookAt(this.camera.look)
  }

  toggleRightClickMenu() {
    if (this.enableContextMenu) {
      this.canvas.oncontextmenu = () => false // 右クリックメニューを無効化。
      this.enableContextMenu = false
    }
    else {
      this.canvas.oncontextmenu = this.contextMenu
      this.enableContextMenu = true
    }
  }
}
