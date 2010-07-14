/**
 * jquery.fullslide plugin
 **/

(function($){
    
    var
    
    options,
    previous_slide,
    index = 0,
    pause = false,
    front,
    back,
    timer;
    
    // API: main init function
    $.fullslide = function(in_options) {
    
        // default options
        options = $.extend({
            fade_duration: 750,
            show_duration: 5000,
            blank_overlay: false,
            on_select_callback : function(from, to) {},
            on_slide_callback : function(from, to) {}
        }, in_options);

        // API: pause slideshow
        arguments.callee.pause = function() {
            if (!pause) {
                pause = true;
                clearTimeout(timer);                
            }
        };

        // API: unpause slideshow
        arguments.callee.unpause = function() {
            if (pause) {
                pause = false;
                _load_slide_from_index();
            }
        };

        // API: select a certain slide via index
        arguments.callee.show = function(in_index) {
            options.on_select_callback(options.slides[index], options.slides[in_index]);
            index = in_index;
            _load_slide_from_index();
        };

        // API: generate lightbox html
        arguments.callee.lightbox = function(wrap) {

            // lazy creation of lightbox
            if (wrap.find('img').length > 0) {
                return;
            }

            var
            link,
            img;
            
            for(var i=0; i<options.slides.length; i++) {
                link = $("<a />")
                    .click(function(idx) {
                        return function() { jQuery.fullslide.show(idx) };
                    }(i));
                
                img = $("<img />")
                    .attr('src', options.slides[i]['thumb'])
                    .attr('alt', options.slides[i]['title'])
                    .addClass( (i==index)?'selected':'unselected')
                    .appendTo(link);
                
                options.slides[i]['thumb img'] = img;
                
                link.appendTo(wrap);                
          }
        };

        $(document).ready(_init);
    
        return this;

    
        function _init() {

            var
    
            common = { left: 0, top: 0 },
    
            wrap = $("<div />")
                .attr("id", "fullslide-wrap")
                .css( $.extend(common, { position: "absolute", zIndex: -1 }));
    
            // if enable use a blank.gif overlay to protect the images
            if (options.blank_overlay) {

                var
    
                blank = $("<div />")
                  .attr("id", "fullslide-blank")
                  .css( $.extend(common, { position: "fixed", overflow: "hidden", zIndex: 1, width: 4000, height: 2000 }))
                  .appendTo(wrap),
        
                img_blank = $("<img />")
                  .attr("src", "images/blank.gif")
                  .css("width", "100%")
                  .css("height", "100%")
                  .appendTo(blank);
            }
    
            // the actual buffers. we load in the back, then make it translucent.
            // switch the backbuffer to front and fade it in.

            var
        
            buffer1 = $("<div />")
                .attr('id', 'fullslide-1')
                .css( $.extend(common, { position: "fixed", overflow: "hidden", zIndex: -2 }))
                .appendTo(wrap),
    
            buffer2 = $("<div />")
                .attr('id', 'fullslide-2')
                .css( $.extend(common, { position: "fixed", overflow: "hidden", zIndex: -3 }))
                .appendTo(wrap),

            img1 = $("<img />")
                .bind("load", function(event) {
                    _load(event, $(this));
                }).appendTo(buffer1),
    
            img2 = $("<img />")
                .bind("load", function(event) {
                    _load(event, $(this));
                }).appendTo(buffer2);
    
            // generate an index property so we can find
            // the index from a slide array
            for (var i=0; i<options.slides.length; i++) {
                options.slides[i]['index'] = i;
            }
    
            $('body').prepend(wrap);

            // show only "loading" at the beginning
            $('#loading').show();
            $('#content').hide();

            // initialize double-buffering
            front = buffer1;
            back = buffer2;

            // load the first image
            _load_slide_from_index();
            
            // resize and position the images on window resize
            $(window).resize(_resize_window);
        }

        // switch double buffers
        function _switch_buffer() {
            var tmp;

            tmp = back;
            back = front;
            front = tmp;
            
            front.css('zIndex', -2);
            back.css('zIndex', -3);
        }

        // called when image finished loading
        function _load(event, image) {

            // remember original image ratio and resize
            image.data('ratio', image.width() / image.height());
            _resize_image(image);
            
            // make sure "loading" is hidden
            $('#loading').hide();
            $('#content').show();

            // callback for slide changes
            options.on_slide_callback(previous_slide, options.slides[index]);
            previous_slide = options.slides[index];
            
            // do the double-buffering and fading dance
            front.css('opacity', 1);
            back.css('opacity', 0);
            _switch_buffer();
            front.animate({ opacity: 1 }, options.fade_duration, function() {

                if (pause) {
                    // in pause mode we do not jump to the next
                    return;
                }

                // update slide after duration configured
                timer = setTimeout(function() {

                    // auto increment slide index
                    index = index + 1;
                    if (index >= options.slides.length) {
                        // roll-over
                        index = 0;
                    }

                    _load_slide_from_index();
                    
                }, options.show_duration);
            });
            
        }

        // loads the image into the background buffer
        function _load_slide_from_index() {
            back.find('img').attr('src', '').css('width', 'auto').css('height', 'auto').attr('src', options.slides[index]['src']);
        }
    
        // adjust and position the images. called on window resize.
        function _resize_window() {
            _resize_image(front.find('img'));
            _resize_image(back.find('img'));
        }
    
        // adjust and position a single image
        function _resize_image(image, on_resize_callback) {
            var
    
            browserwidth = $(window).width(),
            browserheight = $(window).height(),
            bgWidth = browserwidth,
            bgHeight = bgWidth / image.data('ratio');
            
            if(bgHeight < browserheight) {
                bgHeight = browserheight;
                bgWidth = bgHeight * image.data('ratio');
            }
    
            image.width( bgWidth ).height( bgHeight );
            image.parent().css('left', (browserwidth - bgWidth)/2);
            image.parent().css('top', (browserheight - bgHeight)/2);
    
            if (typeof on_resize_callback == "function") on_resize_callback();
        }
    };

})(jQuery);