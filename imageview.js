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
			_view._width = viewWidth;
			_view._height = viewHeight;
			
			if (_view.children.length == 1) {
				_view.resizeImage();
			} else {
				var imageview = Ti.UI.createImageView({ opacity: 0.01, width: Ti.UI.SIZE, height: Ti.UI.SIZE, touchEnabled: false });
					imageview.addEventListener('load', _resizeImage);
					imageview.addEventListener('error', function(e) {
						var _imageview = this;
						_imageview.image = _imageview.parent.brokenLinkImage;
						_imageview.animate({ opacity: 1, duration: 300 });
					});
					_view.add(imageview);
					_view.image && view.setImage(_view.image);
			}
		});
		
	return view;
};

function _setImage(image) {
	this.image = image;
	var _imageview = this.children[0];
	if (_imageview) {
		_imageview.removeEventListener('load', _resizeImage); 
		_imageview.addEventListener('load', _resizeImage);
		_imageview.image = image;
	}
}

function _resizeImage(e) {
	var _imageview = this;
	if (e) { 
		_imageview.removeEventListener('load', _resizeImage); 
	} else {
		_imageview = _imageview.children[0];
	}
	
	var _view = _imageview.parent,
		viewWidth = _view.rect.width,
		viewHeight = _view.rect.height;
	
	var _imageblob = _imageview.toBlob(),
		imageviewWidth  = _imageblob.width,
		imageviewHeight = _imageblob.height;
		
	if (imageviewWidth == viewWidth && imageviewHeight == viewHeight) { 
		return _removeDefaultImage(_view); 
	}
	
	var ldf = Ti.Platform.displayCaps.logicalDensityFactor;
	if (OS_ANDROID) { ldf = 1; }
	
	if (imageviewWidth != viewWidth && imageviewHeight != viewHeight) {
		var size = (viewWidth > viewHeight ? viewWidth : viewHeight);
		_imageblob = _imageblob.imageAsThumbnail(size * ldf, 0, 0);
	}
	
	_imageview.image = _imageblob.imageAsCropped({
		width: viewWidth * ldf, 
		height: viewHeight * ldf, 
		x: Math.floor((_imageblob.width  - viewWidth) / 2),
		y: Math.floor((_imageblob.height - viewHeight) / 2)
	});
	
	_imageview.width = viewWidth;
	_imageview.height = viewHeight;
	
	_removeDefaultImage(_view);
	
	_imageview.animate({ opacity: 1, duration: 300 });
}

function _removeDefaultImage(_view) {
	if (_view.backgroundImage == _view.defaultImage) {
		_view.backgroundImage = '';
	}
}
