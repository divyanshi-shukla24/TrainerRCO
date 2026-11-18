import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BoundingBoxService {
  updateDimensions(wrapper: HTMLElement, img: HTMLImageElement, canvas: HTMLCanvasElement): void {
    if (!canvas || !img) return;
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
  }

  clearCanvas(canvas: HTMLCanvasElement | undefined): void {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  drawPolygon(canvas: HTMLCanvasElement, points: Array<{ x: number; y: number }>): void {
    if (!canvas || !points || points.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(229, 57, 53, 0.2)';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    if (points.length > 2) {
      ctx.closePath();
      ctx.fill();
    }
    ctx.stroke();

    // Draw vertex points
    points.forEach(pt => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e53935';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.ceil(2 * Math.PI));
      ctx.fill();
      ctx.stroke();
    });
  }
}