define(['jquery','events','mybackbone','image','container'],
        function ($,events,mybackbone,image,container) {
    "use strict";

    var View = mybackbone.View.extend({

        initialize: function() {

            var that = this;

        },
        el: '#facsimile-canvas',
        myEvents: {
            'changePage': 'changePage',
            'scheduledRender': 'render',
            'facsimileGotNewImage': 'facsimileGotNewImage',
            'changeMode': 'changeMode'
        },

        events: {
        },

        myModes: ['page'],
        getAttributes: function(attributes, pageDelta) {
            var a = {
                docId : attributes.docId,
                pageNumber : attributes.pageNumber + pageDelta
            };
            return a;
        },
        changePage: function(attributes) {

            var that = this;
            this.attributes = attributes;
            this.nextAttributes = this.getAttributes(attributes,1);
            this.prevAttributes = this.getAttributes(attributes,-1);
            var img = image.get(attributes);
            img.fetch();
            img.tnFetch();
            img.tnLoading.done( function (img) {

                events.delay('facsimileGotNewImage',img, 100);

            });
            img.loading.then(
                function (img) {

                    events.delay('facsimileGotNewImage',img, 100);

                },
                function fail (msg) {

                    events.trigger('changeImageError',{
                        error: 'changeImageError',
                        message: msg
                    });

                }

            );

        },
        facsimileGotNewImage: function(img) {
            if (this.$container !== undefined) {
                this.$container.remove();
            }
            this.$container = $('<div></div>');
            this.$container.attr('class','page-image-container');
            /* if (that.attributes != attributes) return; */
            this.image = img;
            /*
            this.prevImage = undefined;
            this.nextImage = undefined;
            */
            this.lastRenderedCSS = {};
            if (img.loading.state()=="resolved") {
                this.$img = $(this.image.image);
                this.$img.attr('class','page-image');
                this.$img.attr('width','100%');
                this.$img.attr('height','100%');
                this.$container.append(this.$img);
            } else if (img.tnLoading.state()=="resolved") {
                this.$img = $(this.image.tnImage);
                this.$img.attr('class','page-image');
                this.$img.attr('width','100%');
                this.$img.attr('height','100%');
                this.$container.append(this.$img);
            }
            this.$el.append(this.$container);
            this.render();

            events.trigger('changeImage',img); 

            /*

            image.get(this.nextAttributes).done( function (img) {
                if (this.attributes != attributes) return;
                this.nextImage = img;

                container.view.setNextImageSize(img.width,img.height);
                this.render();
            });
            image.get(this.prevAttributes).done( function (img) {
                if (this.attributes != attributes) return;
                this.prevImage = img;
                container.view.setPrevImageSize(img.width,img.height);
                this.render();
            });

            */
        },
        render: function() {

            if (!this.$img) { return; }

            this.$el.css('width',container.cm.getWorldWidth());
            this.$el.css('height',container.cm.getWorldHeight());

            var newCSS = {
                width : container.cm.getPageWidth(),
                height : container.cm.getPageHeight()
            };

            for (var prop in newCSS) {
                if (newCSS[prop] != this.lastRenderedCSS[prop]) {
                    this.$container.css(prop,newCSS[prop]);
                    this.lastRenderedCSS[prop] = newCSS[prop];
                }
            }

            events.trigger('facsimileRendered',this.attributes);

        }
    });

    return {
        view: new View()
    };

});
