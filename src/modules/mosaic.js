import Base from './base.js';
import consts from '../consts';
import MosaicShape from '../shape/mosaic.js';

export default class Mosaic extends Base {
    constructor(parent) {
        super();
        this.setParent(parent);

        this.name = consts.moduleNames.MOSAIC;

        this._dimensions = 20;

        this._listeners = {
            mousedown: this._onFabricMouseDown.bind(this),
            mousemove: this._onFabricMouseMove.bind(this),
            mouseup: this._onFabricMouseUp.bind(this)
        };
    }

    /**
     * @param {{dimensions: ?number}} [setting] - Mosaic width
     */
    start(setting) {
        const canvas = this.getCanvas();

        canvas.defaultCursor = 'crosshair';
        canvas.selection = false;

        setting = setting || {};
        this._dimensions = parseInt(setting.dimensions) || this._dimensions;

        canvas.forEachObject(obj => {
            obj.set({
                evented: false
            });
        });

        canvas.on({
            'mouse:down': this._listeners.mousedown
        });
    }

    end() {
        const canvas = this.getCanvas();

        canvas.defaultCursor = 'default';
        canvas.selection = true;

        canvas.forEachObject(obj => {
            obj.set({
                evented: true
            });
        });

        canvas.off('mouse:down', this._listeners.mousedown);
    }

    _onFabricMouseDown(fEvent) {
        const canvas = this.getCanvas();
        const pointer = this.pointer = canvas.getPointer(fEvent.e);
        this._mosaicShape = new MosaicShape({
            mosaicRects:[],
            selectable:false,
            left: pointer.x,
            top: pointer.y,
            originX: 'center',
            originY: 'center'
        });
        canvas.add(this._mosaicShape);
        canvas.renderAll();
        canvas.on({
            'mouse:move': this._listeners.mousemove,
            'mouse:up': this._listeners.mouseup
        });
    }
    _onFabricMouseMove(fEvent) {
        const canvas = this.getCanvas();
        const pointer = canvas.getPointer(fEvent.e);
        let imageData = canvas.contextContainer.getImageData(parseInt(pointer.x), parseInt(pointer.y), this._dimensions, this._dimensions);
        // let imageData = canvas.getContext().getImageData(parseInt(pointer.x), parseInt(pointer.y), this._dimensions, this._dimensions);
        let rgba = [0, 0, 0, 0];
        let length = imageData.data.length / 4;
        for (let i = 0; i < length; i++) {
            rgba[0] += imageData.data[i * 4];
            rgba[1] += imageData.data[i * 4 + 1];
            rgba[2] += imageData.data[i * 4 + 2];
            rgba[3] += imageData.data[i * 4 + 3];
        }
        this._mosaicShape.addMosicRectWithUpdate({
            left: pointer.x,
            top: pointer.y,
            fill: `rgb(${parseInt(rgba[0] / length)},${parseInt(rgba[1] / length)},${parseInt(rgba[2] / length)})`,
            dimensions: this._dimensions
        });
        canvas.renderAll();
    }

    _onFabricMouseUp() {
        const canvas = this.getCanvas();
        this._mosaicShape = null;
        canvas.off({
            'mouse:move': this._listeners.mousemove,
            'mouse:up': this._listeners.mouseup
        });
    }
}
