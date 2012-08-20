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
		events: {
            'click tr.choice-row': 'onRowClicked',
            'click .add-choice-button': 'clickAddChoice'
        },

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

            this.model.on('change:selection', this.onSelectionChange, this);
        },

        initialRender: function(){
            var content = _.template(template, {
                model: this.model,
                columns: this.columns,
                opts: this.opts
            });
            $(this.el).html(content);

            this.$tableContainer = $('.table-container', this.el);
            this.dataTable = $('.choices-table', this.el).dataTable(_.extend({
                sDom: 't',
                aoColumns: this.formatColumns(),
                bPaginate: false,
                sScrollY: 1,

                // Decorate created rows.
                fnCreatedRow: function(rowEl, data, idx){
                    // Add choice id to row.
                    $(rowEl).data('id', data[0]);
                    // Add 'choice-row' class.
                    $(rowEl).addClass('choice-row');
                }
            }, this.opts.tableOpts));

            this.$scrollBody = $('.dataTables_scrollBody', this.$tableContainer);
            this.$scrollTable = $('.choices-table', this.$scrollBody)
            //this.renderChoices();
        },

        formatColumns: function(){
            // Initialize columns with hidden 
            // id column.
            var formattedColumns = [{
                bVisible: false,
                sTitle: 'id'
            }];

            // Format remaining columns.
            _.each(this.columns, function(column){
                formattedColumns.push({
                    sTitle: column.field
                })
            }, this);

            return formattedColumns;
        },

        renderChoices: function(){
            var formattedChoices = this.formatChoices();
            this.dataTable.fnClearTable();
            this.dataTable.fnAddData(formattedChoices);
        },

        formatChoices: function(){
            var formattedChoices = [];
            _.each(this.choices.models, function(choiceModel){
                formattedChoices.push(this.formatChoice(choiceModel));
            }, this);

            return formattedChoices;
        },

        formatChoice: function(choiceModel){
            var formattedChoice = [choiceModel.id];
            _.each(this.columns, function(column){
                var val = choiceModel.get(column.field);
                if (column.format){
                    val = this.formatter(column.format, val);
                }
                formattedChoice.push(val);
            }, this);
            return formattedChoice;
        },

        resize: function(){
            wrapper_h = $('.dataTables_wrapper', this.el).height();
            container_h = this.$tableContainer.height();
            target_h = container_h - wrapper_h;
            this.$scrollBody.height(target_h);

        },

        ready: function(){
            this.resize();
        },

        onRowClicked: function(event){
            var $row = $(event.currentTarget);
            var rowId = $row.data('id');

            // Update model selection.
            this.model.set('selection', rowId);
        },

        onSelectionChange: function(){
            // Deselect selected row.
            $('.choice-row.selected', this.el).removeClass('selected');

            // Get selected row.
            var selection = this.model.get('selection');
            var $selectedRow = this.getRowById(selection);
            $selectedRow.addClass('selected');
        },

        clickAddChoice: function(){
            //var id = Math.round(50 * Math.random());
            var id = Math.random();
            console.log("new id is: ", id);
            var choice = new Backbone.Model({
                id: id,
                field_a: 'field_a_' + id,
                field_b: 'field_b_' + id,
            });
            var formattedChoice = this.formatChoice(choice);
            this.dataTable.fnAddData(formattedChoice);

            // Get created row.
            var $row =  this.getRowById(id);

            // Animate row.
            $row.hide();
            $row.fadeIn(1500);

            targetScrollTop = $row.offset().top - this.$scrollTable.offset().top;

            this.$scrollBody.animate({
                scrollTop: targetScrollTop
            }, 500);
        },

        getRowById: function(id){
            var $row = $('.choice-row', this.$scrollTable).filter(function() { 
                return $(this).data('id') == id;
            });
            return $row;
        },

	});

	return TableSelectView;
});
		

