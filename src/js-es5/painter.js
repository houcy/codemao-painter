'use strict';

(function () {
  window.Painter = {
    init: function init(w, h) {
      var $painterContent = $('.painter-content');
      var $painterCanvas = $('#painter-canvas');
      var $painterContainer = $('#painter-container');
      var canvas = new fabric.Canvas('painter-canvas');
      var myself = this;
      var width = w;
      var height = h;
      var curColor = '';

      this.$btnPencil = $('.btn-pencil');
      this.$btnPointer = $('.btn-pointer');

      //  todo: use relative width&height!
      if (!width) {
        width = $painterContent.width() - $('.painter-left-buttons').width() - $('.painter-right-buttons').width() - 46;
        height = $painterContent.height() - $('.painter-properties').height() - 26;
      }
      this.width = width;
      this.height = height;
      $painterCanvas.attr('height', height);
      $painterCanvas.attr('width', width);
      this.canvas = canvas;
      canvas.enableRetinaScaling = false;

      $painterContainer.css('visibility', 'visible');
      $painterContainer.hide();

      //  init vue

      this.vm = new Vue({
        el: '#painter-container',
        data: {
          width: 10,
          content: '添加文字后在这里修改',
          type: 'object',
          color: ''
        },
        watch: {
          'content': function content(value) {
            var object = canvas.getActiveObject();
            if (!object) return;

            object.set('text', value).setCoords();
            canvas.renderAll();
          },
          'width': function width(v) {
            var object = canvas.getActiveObject();
            var styleName = 'strokeWidth';
            var value = v;
            value = parseInt(value, 10);
            if (canvas.freeDrawingBrush) {
              canvas.freeDrawingBrush.width = value || 15;
            }
            if (!object) return;

            if (this.type === 'text') {
              styleName = 'fontSize';
            }
            if (object.setSelectionStyles && object.isEditing) {
              var style = {};
              style[styleName] = value;
              object.setSelectionStyles(style);
              object.setCoords();
            } else {
              object[styleName] = value;
            }

            object.setCoords();
            canvas.renderAll();
          },
          'color': function color() {
            curColor = this.color;

            canvas.freeDrawingBrush.color = curColor;

            var activeObject = canvas.getActiveObject();
            var activeGroup = canvas.getActiveGroup();

            if (activeGroup) {
              var objectsInGroup = activeGroup.getObjects();
              canvas.discardActiveGroup();
              objectsInGroup.forEach(function (object) {
                if (object.stroke) {
                  object.setStroke(curColor);
                } else {
                  object.setColor(curColor);
                }
              });
            } else if (activeObject) {
              if (activeObject.stroke) {
                activeObject.setStroke(curColor);
              } else {
                activeObject.setColor(curColor);
              }
            }
            canvas.renderAll();
          }
        }
      });

      function updateScope() {
        var object = canvas.getActiveObject();
        if (!object) return;

        myself.vm.content = object.text || '';
        if (myself.vm.content !== '') {
          myself.vm.type = 'text';
          myself.vm.width = object.fontSize;
        } else {
          myself.vm.type = 'path';
          if (canvas.freeDrawingBrush) {
            myself.vm.width = object.strokeWidth;
          }
        }
      }

      canvas.on('object:selected', updateScope);

      //  init colors
      function initColors() {
        //  let total = 255 * 255 * 255;
        var colors = ['e3135c', 'cd0024', 'f1521e', 'fce932', 'f5a72e', '8b5430', 'bd0add', '9016e8', '4b90e0', '437715', '85d036', 'bae98a', '000000', 'ffffff'];
        //  for (let i = 0; i < total - 100; i += total / 40) {
        //    i = parseInt(i);
        //    let color = i.toString(16);
        //    while (color.length < 6) {
        //        color = '0' + color;
        //    }
        //    $('.painter-colors-wrap').append(template('template-colors', {color: '#' + color}));
        //  }
        for (var i = 0; i < colors.length; ++i) {
          $('.painter-colors-wrap').append(template('template-colors', { color: '#' + colors[i] }));
        }
      }

      initColors();

      $('.painter-btn').on('click', function () {
        var _this = this;

        if (!$(this).hasClass('active')) {
          $(this).parent().find('.painter-btn').removeClass('active');
          $(this).addClass('active');
          if ($(this).hasClass('painter-colors')) {
            (function () {
              canvas.freeDrawingBrush.color = $(_this).attr('data-value');
              curColor = $(_this).attr('data-value');
              myself.vm.color = curColor;

              var activeObject = canvas.getActiveObject();
              var activeGroup = canvas.getActiveGroup();

              if (activeGroup) {
                var objectsInGroup = activeGroup.getObjects();
                canvas.discardActiveGroup();
                objectsInGroup.forEach(function (object) {
                  if (object.stroke) {
                    object.setStroke(curColor);
                  } else {
                    activeObject.setColor(curColor);
                  }
                });
              } else if (activeObject) {
                if (activeObject.stroke) {
                  activeObject.setStroke(curColor);
                } else {
                  activeObject.setColor(curColor);
                }
              }
              canvas.renderAll();
            })();
          }
        }
      });
      function addLine() {
        canvas.add(new fabric.Line([50, 100, 200, 200], {
          left: Math.random() * myself.width,
          top: Math.random() * myself.height,
          stroke: curColor,
          strokeWidth: myself.vm.width
        }));
      }

      function addRect(rectWidth, rectHeight, x, y) {
        var rect = new fabric.Rect({
          top: y,
          left: x,
          width: rectWidth,
          height: rectHeight,
          fill: canvas.freeDrawingBrush.color
        });
        canvas.add(rect);
      }

      function addCircle(radius, x, y) {
        canvas.add(new fabric.Circle({
          left: x,
          top: y,
          fill: canvas.freeDrawingBrush.color,
          radius: 50
        }));
      }

      //  opacity: 0.8
      function addTriangle(triWidth, triHeight, x, y) {
        canvas.add(new fabric.Triangle({
          left: x,
          top: y,
          fill: canvas.freeDrawingBrush.color,
          width: triWidth,
          height: triHeight
        }));
      }

      function addImage(path, x, y) {
        var _this2 = this;

        fabric.Image.fromURL(path, function (image) {
          image.set({
            left: x || 0,
            top: y || 0,
            angle: 0
          }).scale(1).setCoords();
          _this2.canvas.add(image);
          _this2.canvas.renderAll();
        });
      }

      this.addImage = addImage;

      function addText(x, y) {
        var text = '点我选中文字，在画布下方可以修改文字内容和样式哦~';

        var textSample = new fabric.Text(text, {
          left: x || canvas.getWidth() / 2,
          top: y || canvas.getHeight() / 2,
          fontFamily: 'Microsoft YaHei',
          angle: 0,
          fill: canvas.freeDrawingBrush.color,
          scaleX: 1,
          scaleY: 1,
          fontWeight: '',
          originX: 'left',
          hasRotatingPoint: true,
          centerTransform: true
        });

        this.canvas.add(textSample);
      }

      function removeSelected() {
        var activeObject = canvas.getActiveObject();
        var activeGroup = canvas.getActiveGroup();

        if (activeGroup) {
          var objectsInGroup = activeGroup.getObjects();
          canvas.discardActiveGroup();
          objectsInGroup.forEach(function (object) {
            canvas.remove(object);
          });
        } else if (activeObject) {
          canvas.remove(activeObject);
        }
      }

      function cancelSelected() {
        canvas.deactivateAll();
        canvas.renderAll();
        // canvas.discardActiveObject();
      }

      function initEvents() {
        var _this3 = this;

        var $btnPencil = myself.$btnPencil;
        var $btnEraser = $('.btn-eraser');
        var $btnRotation = $('.btn-rotation');
        $('.painter-colors:first-child').click();
        $btnPencil.on('click', function () {
          cancelSelected();
          canvas.setFreeDrawingBrush('pencil', {
            width: 15,
            color: curColor
          });
          canvas.setDrawingMode(true);
          myself.vm.width = 15;
          // canvas.freeDrawingBrush.width=10;
          // canvas.freeDrawingBrush.color=curColor;
        });
        $btnEraser.on('click', function () {
          cancelSelected();
          canvas.setFreeDrawingBrush('eraser', {
            width: 15,
            color: curColor
          });
          canvas.setDrawingMode(true);
          myself.vm.width = 15;
        });
        $btnRotation.on('click', function () {
          cancelSelected();
          canvas.setDrawingMode(true);
          canvas.setFreeDrawingBrush('rotation', {});
        });
        $('.btn-circle').on('click', function () {
          myself.$btnPointer.click();
          addCircle(100, 100, 100);
        });
        $('.btn-rect').on('click', function () {
          myself.$btnPointer.click();
          addRect(100, 100, 100, 100);
        });
        $('.btn-line').on('click', function () {
          myself.$btnPointer.click();
          addLine();
        });
        $('.btn-triangle').on('click', function () {
          myself.$btnPointer.click();
          addTriangle(100, 100, 100, 100);
        });
        $('.btn-text').on('click', function () {
          myself.$btnPointer.click();
          addText(0, 0);
        });

        $btnPencil.click();
        $('.painter-btn-remove').on('click', removeSelected);
        myself.$btnPointer.on('click', function () {
          canvas.setDrawingMode(false);
        });
        $('.painter-btn-close').on('click', function () {
          canvas.setDrawingMode(false);
          $('#painter-container').hide();
        });
        $('.painter-btn-check').on('click', function () {
          var param = {};
          //  todo: Deal with the End
          //  canvas.contextContainer.imageSmoothingEnabled = false;
          canvas.setDrawingMode(false);
          //  result = toBase64();
          canvas.layerManager.combineAllLayers();
          var activeObj = _this3.canvas.getActiveObject();
          var activeGroup = canvas.getActiveGroup();
          if (activeGroup) {
            var objectsInGroup = activeGroup.getObjects();
            canvas.discardActiveGroup();
            objectsInGroup.forEach(function (obj) {
              Object.assign(obj, { active: false });
            });
          }
          if (activeObj) {
            activeObj.active = false;
          }
          canvas.renderAll();
          canvas.setZoom(1);
          //  options.anchorOffsetX = result.rc.x;
          //  options.anchorOffsetY = result.rc.y;

          var data = document.createElement('canvas');
          data.width = canvas.lowerCanvasEl.width;
          data.height = canvas.lowerCanvasEl.height;
          data.getContext('2d').drawImage(canvas.lowerCanvasEl, 0, 0);
          param.img = data;
          param.src = data.toDataURL();
          param.rc = canvas.rotationPoint;
          param.name = $('.painter-name').val();

          if (canvas.callback) {
            canvas.callback(param);
          }

          $('#painter-container').hide();
        });
      }

      initEvents();

      // function toBase64() {
      //   let result;
      //
      //   canvas.layerManager.combineAllLayers();
      //   let activeObj = Painter.canvas.getActiveObject();
      //   let activeGroup = canvas.getActiveGroup();
      //   if (activeGroup) {
      //     let objectsInGroup = activeGroup.getObjects();
      //     canvas.discardActiveGroup();
      //     objectsInGroup.forEach(function (object) {
      //       object.active = false;
      //     });
      //   }
      //   if (activeObj) {
      //     activeObj.active = false;
      //   }
      //   Painter.canvas.renderAll();
      //   Painter.canvas.setZoom(1);
      //   let data = canvas.toDataURL('png');
      //   let img = document.createElement('img');
      //   img.setAttribute('width', width);
      //   img.setAttribute('height', height);
      //   img.setAttribute('src', data);
      //   let c = document.createElement('canvas');
      //   c.setAttribute('width', width);
      //   c.setAttribute('height', height);
      //   let ctx = c.getContext('2d');
      //   ctx.drawImage(img, 0, 0, width, height);
      //   canvas.setZoom(1);
      //
      //   result = trimCanvasWithPosition(c, canvas.rotationPoint);
      //   return result;
      // }
    },

    /**
     * Open image in the canvas
     * @param img
     * @param name
     * @param options
     */
    openIn: function openIn(img, name, options) {
      var x = this.canvas.width / 2;
      var y = this.canvas.height / 2;
      var width = 0;
      var height = 0;
      if (options) {
        width = options.width;
        height = options.height;
        this.canvas.rotationPoint = {
          x: width > this.canvas.width ? x : options.rotationCenter.x + (this.canvas.width - width) / 2,
          y: height > this.canvas.height ? y : options.rotationCenter.y + (this.canvas.height - height) / 2
        };
        this.canvas.callback = options.callback;
      }
      this.canvas.clear();

      $('.painter-name').val(name);

      this.canvas.setHeight(this.height);
      this.canvas.setWidth(this.width);
      this.canvas.renderAll();
      this.addImage(img, (this.canvas.width - width) / 2, (this.canvas.height - height) / 2);

      this.$btnPencil.click();
      $('#painter-container').show();
    },
    destroy: function destroy() {
      $('#painter-container').hide();
    }
  };
})();

//# sourceMappingURL=painter.js.map