define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
		],
function($, Backbone, _, ui){

	var TableSelectView = Backbone.View.extend({
		events: {},

		initialize: function(opts){
            opts = opts || {};

			if (! this.model){
				this.model = new Backbone.Model();
			}
        }
	});

	return TableSelectView;
});
		

