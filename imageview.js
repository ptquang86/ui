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
					imageview.addEventListener('load', _view.resizeImage);
					imageview.addEventListener('error', function(e) {
						var _imageview = this;
						_imageview.image = _imageview.parent.brokenLinkImage;
						_imageview.animate({ opacity: 1, duration: 300 });
					});
					_view.image && (imageview.image = _view.image);
					_view.add(imageview);
			}
		});
		
	return view;
};

function _setImage(image) {
	this.image = image;
	var _imageview = this.children[0];
	_imageview && (_imageview.image = image);
}

function _resizeImage(e) {
	var _imageview = this;
	if (e == null) { _imageview = _imageview.children[0]; }
	
	var _view = _imageview.parent,
		viewWidth = _view.rect.width,
		viewHeight = _view.rect.height,
		imageviewWidth  = _imageview.rect.width,
		imageviewHeight = _imageview.rect.height,
		ratio = imageviewWidth / imageviewHeight;

	if (_view.backgroundImage == _view.defaultImage) {
		_view.backgroundImage = '';
	}

	if (imageviewWidth == viewWidth && imageviewHeight == viewHeight) { return; }
		
	if (imageviewHeight < viewHeight) {
		imageviewHeight = viewHeight;
		imageviewWidth  = ratio * imageviewHeight;
	}
	
	if (imageviewWidth < viewWidth) {
		imageviewWidth = viewWidth;
		imageviewHeight = imageviewWidth / ratio;
	}
	
	imageviewWidth = Math.floor(imageviewWidth);
	imageviewHeight = Math.floor(imageviewHeight);
	
	_imageview.animate({ opacity: 1, duration: 300 });
}
