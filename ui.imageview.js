/*
 USAGE:
 
 - style
 ".photo": { defaultImage: '/images/default_avatar.png', brokenLinkImage: '/images/default_avatar.png' }
 
 - view
 <ImageView module="ui" class="photo" image="xyz"/>
 - or controller
 
 require('ui').createImageView( $.createStyle({ classes: 'photo', image: 'xyz' }) );
 * */
exports.createImageView = function(args) {
	if (!args.image && !args.backgroundImage) {
		args.backgroundImage = args.defaultImage;
	}
	
	var view = Ti.UI.createView(args);
		view.setImage = _setImage;
		view.resizeImage = _resizeImage;
		view.addEventListener('postlayout', function(e) {
			var _view = this,
				viewWidth = _view.rect.width,
				viewHeight = _view.rect.height;
			if (viewWidth == _view._width && viewHeight == _view._height) { return; }
			this._width = viewWidth;
			this._height = viewHeight;
			
			if (_view.children.length) {
				_view.resizeImage();
			} else {
				var imageview = Ti.UI.createImageView({ opacity: 0, width: Ti.UI.SIZE, height: Ti.UI.SIZE, touchEnabled: false });
					imageview.addEventListener('load', _view.resizeImage);
					imageview.addEventListener('error', function(e) {
						var _imageview = this;
						_imageview.image = _imageview.parent.brokenLinkImage;
						_imageview.animate({ opacity: 0, duration: 300 });
					});
					_view.image && (imageview.image = _view.image);
					_view.add(imageview);
			}
		});
		
	return view;
};

function _setImage(image) {
	this.image = image;
	this.children[0].image = image;
}

function _resizeImage(e) {
	var _imageview = this;
	if (typeof _imageview.resizeImage == 'function') { _imageview = _imageview.children[0]; }
	
	var _view = _imageview.parent,
		viewWidth = _view.rect.width,
		viewHeight = _view.rect.height,
		width  = _imageview.rect.width,
		height = _imageview.rect.height,
		ratio = width / height;

	if (_view.backgroundImage == _view.defaultImage) {
		_view.backgroundImage = '';
	}

	if (_imageview.width == viewWidth && _imageview.height == viewHeight) { return; }
		
	if (height < viewHeight) {
		height = viewHeight;
		width  = ratio * height;
	}
	if (width < viewWidth) {
		width = viewWidth;
		height = width / ratio;
	}
	
	_imageview.width = Math.floor(width);
	_imageview.height = Math.floor(height);
	
	_imageview.animate({ opacity: 1, duration: 300 });
}
