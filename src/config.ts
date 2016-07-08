import {Brush} from "./def/Brush";
export const config = {
  control_buttons: [
    {
      title: '撤销',
      action: 'undo',
      className: ['undo'],
    },
    {
      title: '重做',
      action: 'redo',
      className: ['redo'],
    },
    {
      title: '清空画布',
      action: 'clear',
      className: ['clear'],
    },
  ],
  default_colors: [
    '#D0021B', '#F5A623', '#8B572A', '#7ED321', '#417505',
    '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', '#B8E986',
    '#000', '#4A4A4A', '#9B9B9B', '#D3D3D3', '#FFF',
  ],
  default_states: {
    panel_type: 'painting',
    current_color: '#333',
    current_width: 7,
    current_brush: Brush.pencil,
    line_width: {
      pencil: 7,
      pointer: 7,
      line: 7,
      eraser: 7
    },
    brush_color: {
      pencil: '#333',
      pointer: '#333',
      line: '#333'
    },
  },
};
