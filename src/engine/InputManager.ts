export interface MouseDelta {
  x: number;
  y: number;
}

export class InputManager {
  private keyState: Map<string, boolean> = new Map();
  private mouseButtonState: Map<number, boolean> = new Map();
  private mouseDelta: MouseDelta = { x: 0, y: 0 };
  private mouseAccum: MouseDelta = { x: 0, y: 0 };
  private pointerLocked = false;
  private canvas: HTMLElement | null = null;

  init(canvas: HTMLElement): void {
    this.canvas = canvas;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    canvas.addEventListener('click', () => canvas.requestPointerLock());
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas?.removeEventListener('mousedown', this.onMouseDown);
    this.canvas?.removeEventListener('mouseup', this.onMouseUp);
    this.canvas?.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.exitPointerLock();
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keyState.set(e.code, true);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keyState.set(e.code, false);
  };

  private onMouseDown = (e: MouseEvent): void => {
    this.mouseButtonState.set(e.button, true);
  };

  private onMouseUp = (e: MouseEvent): void => {
    this.mouseButtonState.set(e.button, false);
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (this.pointerLocked) {
      this.mouseAccum.x += e.movementX;
      this.mouseAccum.y += e.movementY;
    }
  };

  private onPointerLockChange = (): void => {
    this.pointerLocked = document.pointerLockElement === this.canvas;
  };

  isKeyDown(code: string): boolean {
    return this.keyState.get(code) === true;
  }

  isMouseButtonDown(button: number): boolean {
    return this.mouseButtonState.get(button) === true;
  }

  getMouseDelta(): MouseDelta {
    this.mouseDelta.x = this.mouseAccum.x;
    this.mouseDelta.y = this.mouseAccum.y;
    this.mouseAccum.x = 0;
    this.mouseAccum.y = 0;
    return { ...this.mouseDelta };
  }

  isPointerLocked(): boolean {
    return this.pointerLocked;
  }
}
