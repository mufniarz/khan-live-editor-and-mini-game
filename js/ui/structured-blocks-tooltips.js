(function() {
    var ESC = 27;

    window.StructuredBlocksTooltips = Backbone.View.extend({
        events: {
            "mousedown .block-rgb.block-name-r": "showColorPicker",
            "focusin .block-rgb.block-name-r": "showColorPicker",
            "mousedown .block-number .input": "showNumberScrubber",
            "focusin .block-number .input": "showNumberScrubber"
        },

        initialize: function() {
            this.render();
            this.bind();
        },

        render: function() {
            this.$colorPicker = $("<div class='tooltip picker active'>" +
                "<div class='picker'></div>" +
                "<div class='arrow'></div></div>")
                // Prevent dragging
                .on("mousedown", function() {
                    return false;
                })
                .find(".picker")
                    .ColorPicker({flat: true})
                .end()
                .hide();

            this.colorPicker = this.$colorPicker.find(".colorpicker")
                .data("colorpicker");

            this.numberScrubber = new TooltipEngine.classes.numberScrubber({
                clickOnly: true
            });
        },

        bind: function() {
            $(window).on("mousedown", function(e) {
                var target = e.target;

                if (target.nodeName.toLowerCase() === "input") {
                    target = target.parentNode;
                }

                var colorPicker = this.$colorPicker[0];
                var numberScrubber = this.numberScrubber.$el[0];

                if (!$.contains(target, colorPicker) &&
                    !$.contains(colorPicker, target)) {
                    this.hideColorPicker();
                }

                if (!$.contains(target, numberScrubber) &&
                    !$.contains(numberScrubber, target)) {
                    this.hideNumberScrubber();
                }
            }.bind(this));

            $(window).on("keydown", function(e) {
                if (e.which === ESC) {
                    this.hideColorPicker();
                    this.hideNumberScrubber();
                }
            }.bind(this));
        },

        showColorPicker: function(e) {
            var $target = $(e.currentTarget);
            var $block = $target.closest(".block-statement");
            var pos = $target.position();
            var $offsetParent = $target.offsetParent();

            this.colorPicker.onChange = function(hsb, hex, rgb) {
                $block.trigger("updateColor", rgb);
            };

            this.$colorPicker
                .appendTo($block)
                .css({
                    top: pos.top + 5 + $offsetParent[0].scrollTop,
                    left: pos.left + $target.width() + 5 +
                        $offsetParent[0].scrollLeft
                })
                .find(".picker")
                    .ColorPickerSetColor($block.data("color"))
                .end()
                .show();
        },

        hideColorPicker: function() {
            this.colorPicker.onChange = function() {};
            this.$colorPicker.hide();
        },

        showNumberScrubber: function(e) {
            var $target = $(e.target);
            var $block = $target.closest(".block-number");
            var pos = $target.position();
            var $offsetParent = $target.offsetParent();

            this.numberScrubber.updateText = function(val) {
                $block.trigger("updateValue", val);
                updateScrubberPos();
            }.bind(this);

            var updateScrubberPos = function() {
                this.numberScrubber.$el.css({
                    top: pos.top + $target.outerHeight() +
                        $offsetParent[0].scrollTop,
                    left: pos.left + Math.round($target.width() / 2) +
                        $offsetParent[0].scrollLeft
                });
            }.bind(this);

            this.numberScrubber.updateTooltip(
                parseFloat($block.data("value")), 0);

            this.numberScrubber.$el
                .appendTo($block)
                .show();

            updateScrubberPos();
        },

        hideNumberScrubber: function() {
            this.numberScrubber.updateText = function() {};
            this.numberScrubber.$el.hide();
        }
    });
})();