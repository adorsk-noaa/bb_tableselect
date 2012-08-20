define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"use!DataTables",
	"text!./templates/TableSelect.html",
		],
function($, Backbone, _, ui, _s, DataTables, template){

	var TableSelectView = Backbone.View.extend({
		events: {},

		initialize: function(opts){
            $(this.el).addClass('table-select');
            this.opts = opts || {};

            this.formatter = this.opts.formatter || _s.sprintf;

			if (! this.model){
				this.model = new Backbone.Model();
			}

            this.columns = this.opts.columns || [];

            // Initialize sub collections.
            _.each(['choices'], function(attr){
                var collection = this.model.get(attr);
                if (! collection){
                    this.model.set(attr, new Backbone.Collection);
                }
            }, this);
            this.choices = this.model.get('choices');

            this.initialRender();

            // Listen for events.
            this.on('resize', this.resize, this);
            this.on('ready', this.ready, this);
        },

        initialRender: function(){
            var content = _.template(template, {
                model: this.model,
                columns: this.columns
            });
            $(this.el).html(content);

            this.$tableContainer = $('.table-container', this.el);
            this.dataTable = $('.choices-table', this.el).dataTable(_.extend({
                sDom: 't',
                bPaginate: false,
                sScrollY: 1
            }, this.opts.tableOpts));
            this.renderChoices();
            window.dt = this.dataTable;
        },

        renderChoices: function(){
            var formattedChoices = this.formatChoices();
            this.dataTable.fnClearTable();
            this.dataTable.fnAddData(formattedChoices);
        },

        formatChoices: function(){
            var formattedChoices = [];
            _.each(this.choices.models, function(choiceModel){
                var formattedChoice = [];
                _.each(this.columns, function(column){
                    var val = choiceModel.get(column.field);
                    if (column.format){
                        val = this.formatter(column.format, val);
                    }
                    formattedChoice.push(val);
                }, this);
                formattedChoices.push(formattedChoice);
            }, this);

            return formattedChoices;
        },

        resize: function(){
            wrapper_h = $('.dataTables_wrapper', this.el).height();
            container_h = this.$tableContainer.height();
            target_h = container_h - wrapper_h;
            $('.dataTables_scrollBody', this.el).height(target_h);

        },

        ready: function(){
            this.resize();
        }

	});

	return TableSelectView;
});
		

