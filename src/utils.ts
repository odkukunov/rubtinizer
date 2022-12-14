export function IsPointInRect(point, rect) {
  return rect.left <= point.x && rect.top <= point.y && rect.right >= point.x && rect.bottom >= point.y;
}

export function RandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}
