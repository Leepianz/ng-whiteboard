import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import * as d3 from 'd3-selection';
import { select } from 'd3-selection';
import {
  ElementTypeEnum,
  FormatType,
  IAddImage,
  LineCapEnum,
  LineJoinEnum,
  NgWhiteboardComponent,
  NgWhiteboardService,
  WhiteboardElement,
} from 'ng-whiteboard';
import { ToolsEnum } from './models/tools.enum';
import Utils from './ng-whiteboard.utils';

describe('NgWhiteboardComponent', () => {
  let component: NgWhiteboardComponent;
  let fixture: ComponentFixture<NgWhiteboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NgWhiteboardComponent],
      providers: [NgWhiteboardService],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgWhiteboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jest.restoreAllMocks();
  });

  it('should create instance', () => {
    expect(component).toBeDefined();
  });
  describe('initialize', () => {
    it('should have an svg with id #svgroot', () => {
      const svgroot = fixture.nativeElement.querySelector('#svgroot');

      expect(svgroot).toBeDefined();
      expect(svgroot instanceof SVGElement).toBeTruthy();
    });

    it(`should have data property as array`, () => {
      expect(component.data).toBeDefined();
      expect(Array.isArray(component.data)).toBeTruthy();
    });

    it('should initialize the service observables', () => {
      expect(component['_subscriptionList'].length).toBe(7);
    });

    it('should trigger start event', () => {
      // arrange
      jest.spyOn(component, 'handleStartEvent');
      const redoState: WhiteboardElement[] = [new WhiteboardElement(ElementTypeEnum.BRUSH, {})];
      component['redoStack'] = [redoState];
      const element = document.createElement('svg');
      document.body.appendChild(element);
      const selection = select<Element, unknown>(element);
      // act
      component.initializeEvents.call(component, selection);
      element.dispatchEvent(
        new MouseEvent('mousedown', {
          view: window,
        })
      );
      // assert
      expect(component.handleStartEvent).toHaveBeenCalled();
      expect(component['redoStack'].length).toBe(0);
    });

    it('should trigger drag event', () => {
      // arrange
      jest.spyOn(component, 'handleDragEvent');
      const element = document.createElement('svg');
      document.body.appendChild(element);
      const selection = select<Element, unknown>(element);
      // act
      component.initializeEvents.call(component, selection);
      element.dispatchEvent(
        new MouseEvent('mousedown', {
          view: window,
        })
      );
      element.dispatchEvent(
        new MouseEvent('mousemove', {
          view: window,
        })
      );
      // assert
      expect(component.handleDragEvent).toHaveBeenCalled();
    });

    it('should not trigger drag event before start event', () => {
      // arrange
      jest.spyOn(component, 'handleDragEvent');
      const element = document.createElement('svg');
      document.body.appendChild(element);
      const selection = select<Element, unknown>(element);
      // act
      component.initializeEvents.call(component, selection);
      element.dispatchEvent(
        new MouseEvent('mousemove', {
          view: window,
        })
      );
      // assert
      expect(component.handleDragEvent).not.toHaveBeenCalled();
    });

    it('should trigger end event', () => {
      // arrange
      jest.spyOn(component, 'handleEndEvent');
      const element = document.createElement('svg');
      document.body.appendChild(element);
      const selection = select<Element, unknown>(element);
      // act
      component.initializeEvents.call(component, selection);
      element.dispatchEvent(
        new MouseEvent('mousedown', {
          view: window,
        })
      );
      element.dispatchEvent(
        new MouseEvent('mouseup', {
          view: window,
        })
      );
      // assert
      expect(component.handleEndEvent).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should update component options with provided values', () => {
      // arrange
      const options = {
        selectedTool: ToolsEnum.RECT,
        drawingEnabled: true,
        canvasWidth: 100,
        canvasHeight: 100,
        fullScreen: true,
        center: true,
        strokeColor: '#fff',
        strokeWidth: 5,
        backgroundColor: '#000',
        lineJoin: LineJoinEnum.ROUND,
        lineCap: LineCapEnum.ROUND,
        fill: '#000',
        zoom: 1,
        fontFamily: 'arial',
        fontSize: 16,
        dasharray: 'string',
        dashoffset: 0,
        x: 0,
        y: 0,
        enableGrid: true,
        gridSize: 16,
        snapToGrid: true,
      };
      // act
      component.options = options;
      component.ngOnChanges({
        options: {
          firstChange: true,
          currentValue: options,
          previousValue: {},
          isFirstChange: () => true,
        },
      });
      // assert
      expect(component.selectedTool).toBe(ToolsEnum.RECT);
      expect(component.drawingEnabled).toBe(true);
      expect(component.canvasWidth).toBe(100);
      expect(component.canvasHeight).toBe(100);
      expect(component.fullScreen).toBe(true);
      expect(component.center).toBe(true);
      expect(component.strokeColor).toBe('#fff');
      expect(component.strokeWidth).toBe(5);
      expect(component.backgroundColor).toBe('#000');
      expect(component.lineJoin).toBe(LineJoinEnum.ROUND);
      expect(component.lineCap).toBe(LineCapEnum.ROUND);
      expect(component.fill).toBe('#000');
      expect(component.zoom).toBe(1);
      expect(component.fontFamily).toBe('arial');
      expect(component.fontSize).toBe(16);
      expect(component.dasharray).toBe('string');
      expect(component.dashoffset).toBe(0);
      expect(component.x).toBe(0);
      expect(component.y).toBe(0);
      expect(component.enableGrid).toBe(true);
      expect(component.gridSize).toBe(16);
      expect(component.snapToGrid).toBe(true);
    });
  });
  describe('ngAfterViewInit', () => {
    it('should calls initializeEvents method', () => {
      jest.spyOn(component, 'initializeEvents');
      component.ngAfterViewInit();
      expect(component.initializeEvents).toHaveBeenCalled();
    });
    it('should emit ready event', () => {
      // arrange
      jest.spyOn(component.ready, 'emit');
      // act
      component.ngAfterViewInit();
      // assert
      expect(component.ready.emit).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from events', () => {
      // arrange
      jest.spyOn(component['_subscriptionList'][0], 'unsubscribe');
      // act
      component.ngOnDestroy();
      // assert
      expect(component['_subscriptionList'][0].unsubscribe).toHaveBeenCalled();
    });
  });

  describe('handleImageTool', () => {
    it('should add image to component when file is uploaded', () => {
      // Arrange
      jest.spyOn(d3, 'mouse').mockImplementation(jest.fn(() => [100, 200]));
      const selectionNode = document.createElement('svg');
      component['selection'] = select<Element, unknown>(selectionNode);
      const input = document.createElement('input');
      const file = new File(['image'], 'image.png', { type: 'image/png' });
      jest.spyOn(document, 'createElement').mockReturnValue(input);
      jest.spyOn(input, 'click');
      jest.spyOn(input, 'addEventListener').mockImplementation((event, callback: any) => {
        if (event === 'change') {
          callback({ target: { files: [file] } });
        }
      });
      const addImageSpy = jest.spyOn(component, 'addImage');

      // Act
      component.handleImageTool();

      // Assert
      expect(input.click).toHaveBeenCalled();
      // expect(readerMock.readAsDataURL).toHaveBeenCalledWith(file);
      // expect(addImageSpy).toHaveBeenCalledWith({ image: readerResult, x: expect.any(Number), y: expect.any(Number) });
    });
  });
  describe('handleSelectTool', () => {
    beforeEach(() => {
      const initialData = [
        new WhiteboardElement(ElementTypeEnum.BRUSH, {}),
        new WhiteboardElement(ElementTypeEnum.RECT, {
          x1: 100,
          y1: 100,
          x2: 200,
          y2: 200,
          width: 10,
          height: 10,
        }),
        new WhiteboardElement(ElementTypeEnum.TEXT, {}),
      ];

      component.data = initialData;
      Object.defineProperty(global.SVGElement.prototype, 'getBBox', {
        writable: true,
        value: jest.fn().mockReturnValue({
          x: 0,
          y: 0,
        }),
      });
      fixture.detectChanges();
    });

    it('should clear selected element if mouse target is null', () => {
      component['_getMouseTarget'] = jest.fn().mockReturnValue(null);
      component.handleSelectTool();
      expect(component.selectedElement).toBeNull();
    });

    it('should clear selected element if mouse target is the "selectorGroup"', () => {
      const selectorGroup: SVGGraphicsElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      selectorGroup.setAttribute('id', 'selectorGroup');
      component['_getMouseTarget'] = jest.fn().mockReturnValue(selectorGroup);

      component.handleSelectTool();

      expect(component.selectedElement).toBeUndefined();
    });

    it('should select the clicked element', () => {
      const element = component.data[1];
      const elementNode = document.getElementById('item_' + element.id);
      component['_getMouseTarget'] = jest.fn().mockReturnValue(elementNode);
      component.handleSelectTool();
      expect(component.selectedElement).toEqual(element);
    });
  });

  describe('handleEraserTool', () => {
    beforeEach(() => {
      const initialData = [new WhiteboardElement(ElementTypeEnum.BRUSH, {})];

      component.data = initialData;

      fixture.detectChanges();
    });
    it('should not remove element if mouse_target not defined', () => {
      component['_getMouseTarget'] = jest.fn().mockReturnValue(null);
      const emitSpy = jest.spyOn(component.deleteElement, 'emit');
      expect(component.data.length).toEqual(1);

      component.handleEraserTool();

      expect(component.data.length).toEqual(1);
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should remove element from data and emit deleteElement', () => {
      const element = component.data[0];
      const elementNode = document.getElementById('item_' + element.id);
      component['_getMouseTarget'] = jest.fn().mockReturnValue(elementNode);
      const emitSpy = jest.spyOn(component.deleteElement, 'emit');

      expect(component.data.length).toEqual(1);

      component.handleEraserTool();

      expect(component.data.length).toEqual(0);
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('handleTextTool', () => {
    beforeEach(() => {
      component.selectedTool = ToolsEnum.TEXT;
      fixture.detectChanges();
    });

    it('should finish the current text element if there is one', () => {
      // arrange
      const element = new WhiteboardElement(ElementTypeEnum.TEXT, {});
      component.tempElement = element;
      jest.spyOn(component, 'finishTextInput');
      const input = document.createElement('input');
      component['textInput'] = { nativeElement: input };

      // act
      component.handleTextTool();

      // assert
      expect(component.tempElement).toBeNull();
      expect(component.finishTextInput).toHaveBeenCalled();
    });
    it('should create a new text element and set focus on text input', () => {
      // arrange
      jest.spyOn(d3, 'mouse').mockImplementation(jest.fn(() => [100, 200]));
      const element = new WhiteboardElement(ElementTypeEnum.TEXT, {});
      component['_generateNewElement'] = jest.fn().mockReturnValue(element);
      const input = document.createElement('input');
      jest.spyOn(input, 'focus');
      component['textInput'] = { nativeElement: input };
      // act
      component.handleTextTool();

      // assert
      expect(component.tempElement).not.toBeNull();
      expect(component.tempElement.type).toBe(element.type);
      expect(component.tempElement.options.top).toBe(200);
      expect(component.tempElement.options.left).toBe(100);
      // expect(component['textInput'].nativeElement.focus).toHaveBeenCalled();
    });

    it('updates the text element position when dragging', () => {
      // arrange
      const x = 10;
      const y = 20;
      jest.spyOn(d3, 'mouse').mockImplementation(jest.fn(() => [x, y]));
      component.tempElement = { options: { top: 0, left: 0 } } as any;

      // act
      component.handleTextDrag();

      // assert
      expect(component.tempElement.options.top).toBe(y);
      expect(component.tempElement.options.left).toBe(x);
    });

    it('should push the current element to undo', () => {
      // arrange
      component['_pushToUndo'] = jest.fn();
      component.tempElement = {} as any;

      // act
      component.handleTextEnd();

      // assert
      expect(component['_pushToUndo']).toHaveBeenCalled();
    });

    it('should skip push the current element to undo if tempElement id not defined', () => {
      // arrange
      component['_pushToUndo'] = jest.fn();

      // act
      component.handleTextEnd();

      // assert
      expect(component['_pushToUndo']).not.toHaveBeenCalled();
    });
  });

  describe('saveDraw', () => {
    it('should save the board as base64 and emit save event', fakeAsync(() => {
      // arrange
      jest.spyOn(component.save, 'emit');
      Utils.svgToBase64 = jest.fn().mockReturnValue('');
      // act
      component.saveDraw('image', FormatType.Base64);
      flush();
      // assert
      expect(component.save.emit).toHaveBeenCalled();
    }));
  });
  describe('addImage', () => {
    let mockImage: IAddImage;
    let imageOnload: any;

    beforeEach(() => {
      mockImage = {
        image: 'https://via.placeholder.com/150',
        x: 10,
        y: 20,
      };
      Object.defineProperty(Image.prototype, 'onload', {
        get() {
          return this._onload;
        },
        set(fn) {
          imageOnload = fn;
          this._onload = fn;
        },
      });
    });
    it('should add the image to the data and emit imageAdded event', () => {
      // arrange
      jest.spyOn(component.imageAdded, 'emit');
      // act
      component.addImage(mockImage);
      if (imageOnload) {
        imageOnload();
      }

      // assert
      expect(component.data.length).toBe(1);
      expect(component.imageAdded.emit).toHaveBeenCalled();
    });

    it('should revert x, y to 0 if less than 0', () => {
      // arrange
      mockImage = {
        image: 'https://via.placeholder.com/150',
        x: -5,
        y: -10,
      };
      // act
      component.addImage(mockImage);
      if (imageOnload) {
        imageOnload();
      }
      // assert
      expect(component.data[0].x).toBe(0);
      expect(component.data[0].y).toBe(0);
    });
  });

  describe('clearDraw', () => {
    it('should clear drawing data and emit "clear" event', () => {
      // Arrange
      const initialData = [new WhiteboardElement(ElementTypeEnum.BRUSH, {})];
      component.data = initialData;
      const spyClearEmit = jest.spyOn(component.clear, 'emit');

      // Act
      component.clearDraw();

      // Assert
      expect(component.data).toEqual([]);
      expect(spyClearEmit).toHaveBeenCalled();
    });
  });
  describe('undoDraw', () => {
    it('should not undo anything if the undo stack is empty', () => {
      // arrange
      const spyUndoEmit = jest.spyOn(component.undo, 'emit');

      // act
      component.undoDraw();
      // assert
      expect(component['undoStack'].length).toBe(0);
      expect(component['redoStack'].length).toBe(0);
      expect(spyUndoEmit).not.toHaveBeenCalled();
    });

    it('should undo the last draw action and emit the "undo" event', () => {
      // arrange
      const spyUndoEmit = jest.spyOn(component.undo, 'emit');
      const initialData: WhiteboardElement[] = [new WhiteboardElement(ElementTypeEnum.BRUSH, {})];
      component['undoStack'] = [initialData];

      // act
      component.undoDraw();

      // assert
      expect(component['undoStack'].length).toBe(0);
      expect(component['redoStack'].length).toBe(1);
      expect(component['redoStack'][0]).toBe(initialData);
      expect(spyUndoEmit).toHaveBeenCalled();
    });
  });
  describe('redoDraw', () => {
    it('should not redo anything when redoStack is empty', () => {
      // arrange
      const spyRedoEmit = jest.spyOn(component.redo, 'emit');
      const initialData: WhiteboardElement[] = [new WhiteboardElement(ElementTypeEnum.BRUSH, {})];
      component['undoStack'] = [initialData];
      component['redoStack'] = [];

      // act
      component.redoDraw();

      // assert
      expect(component['undoStack'].length).toBe(1);
      expect(component['redoStack'].length).toBe(0);
      expect(spyRedoEmit).not.toHaveBeenCalled();
    });
    it('should redo the last undone action when redoStack is not empty', () => {
      // arrange
      const spyRedoEmit = jest.spyOn(component.redo, 'emit');
      const redoState: WhiteboardElement[] = [new WhiteboardElement(ElementTypeEnum.BRUSH, {})];
      component['redoStack'] = [redoState];
      component['undoStack'] = [];

      // act
      component.redoDraw();

      // assert
      expect(component['undoStack'].length).toBe(1);
      expect(component['redoStack'].length).toBe(0);
      expect(spyRedoEmit).toHaveBeenCalled();
    });
  });
});
