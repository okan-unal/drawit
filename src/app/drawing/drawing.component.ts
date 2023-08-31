import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { saveAs } from 'file-saver';

export enum DrawingTool {
  LINE = 'line',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  PEN = 'pen'
}

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.css']
})
export class DrawingComponent implements AfterViewInit {
  DrawingTool = DrawingTool;
  @ViewChild('drawingCanvas', { static: false }) drawingCanvas?: ElementRef<HTMLCanvasElement>;
  private ctx?: CanvasRenderingContext2D | null;
  private drawing = false;

  currentTool: DrawingTool = DrawingTool.LINE;
  startPoint?: { x: number, y: number };
  private drawings: string[] = [];
  private undoStack: string[] = [];

  ngAfterViewInit(): void {
    if (this.drawingCanvas) {
      this.ctx = this.drawingCanvas.nativeElement.getContext('2d');
      if (this.ctx) {
        this.ctx.lineWidth = 5;
      }
    }
  }

  startDrawing(event: MouseEvent): void {
    this.drawing = true;
    this.startPoint = {
      x: event.clientX - (this.drawingCanvas?.nativeElement.getBoundingClientRect().left || 0),
      y: event.clientY - (this.drawingCanvas?.nativeElement.getBoundingClientRect().top || 0)
    };
    this.addToDrawings();
  }

  draw(event: MouseEvent): void {
    if (!this.drawing || !this.ctx || !this.startPoint) return;

    const currentX = event.clientX - (this.drawingCanvas?.nativeElement.getBoundingClientRect().left || 0);
    const currentY = event.clientY - (this.drawingCanvas?.nativeElement.getBoundingClientRect().top || 0);

    this.ctx.beginPath();

    switch (this.currentTool) {
      
      case DrawingTool.LINE:
        this.ctx.moveTo(this.startPoint.x, this.startPoint.y);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        break;
      case DrawingTool.RECTANGLE:
        this.ctx.rect(this.startPoint.x, this.startPoint.y, currentX - this.startPoint.x, currentY - this.startPoint.y);
        this.ctx.stroke();
        break;
      case DrawingTool.CIRCLE:
        const radius = Math.sqrt((currentX - this.startPoint.x) ** 2 + (currentY - this.startPoint.y) ** 2);
        this.ctx.arc(this.startPoint.x, this.startPoint.y, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        break;
        case DrawingTool.PEN:
        this.ctx.moveTo(this.startPoint.x, this.startPoint.y);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        this.startPoint = { x: currentX, y: currentY };  // Bu satırı ekleyin.
      break;
      default:
      break;

    }

    this.ctx.closePath();
  }

  setTool(tool: DrawingTool): void {
    this.currentTool = tool;
  }

  addToDrawings(): void {
    if (!this.drawingCanvas || !this.ctx) return;
    const dataURL = this.drawingCanvas.nativeElement.toDataURL();
    this.drawings.push(dataURL);
  }

  undo(): void {
    if (!this.drawingCanvas || this.drawings.length === 0 || !this.ctx) return;

    const lastDrawing = this.drawings.pop();
    if (lastDrawing) {
      this.undoStack.push(lastDrawing);
      this.ctx.clearRect(0, 0, this.drawingCanvas?.nativeElement.width || 0, this.drawingCanvas?.nativeElement.height || 0);
      
      if (this.drawings.length > 0) {
        const image = new Image();
        image.src = this.drawings[this.drawings.length - 1];
        image.onload = () => {
          this.ctx?.drawImage(image, 0, 0);
        };
      }
    }
  }

  clearCanvas(): void {
    if (!this.ctx || !this.drawingCanvas) return;
    this.ctx.clearRect(0, 0, this.drawingCanvas?.nativeElement.width || 0, this.drawingCanvas?.nativeElement.height || 0);
  }
  
  saveDrawing(): void {
    if (!this.drawingCanvas) return;
    const dataURL = this.drawingCanvas.nativeElement.toDataURL();
    saveAs(dataURL, 'myDrawing.png');
  }

  stopDrawing(): void {
    if (!this.ctx) return;
    this.drawing = false;
    this.ctx.closePath();
  }
}
