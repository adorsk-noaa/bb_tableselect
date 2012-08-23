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
			"click .reset-button": "clearSelection"
        },

		initialize: function(opts){
            $(this.el).addClass('table-select');
            this.opts = opts || {};

			if (! this.model){
				this.model = new Backbone.Model();
			}

            // Initialize sub collections.
            _.each(['choices'], function(attr){
                var collection = this.model.get(attr);
                if (! collection){
                    this.model.set(attr, new Backbone.Collection);
                }
            }, this);
            this.choices = this.model.get('choices');

            this.columns = this.opts.columns || [];
            this.selectionLabelAttr = this.opts.selectionLabelAttr || 'id';
            this.selectionValueAttr = this.opts.selectionValueAttr || 'id';
            this.inputName = this.opts.inputName || this.cid;

            this.initialRender();

            this.postInitialize();
        },
        
        postInitialize: function(){
            // Add reset control to title controls.
            this.addResetButton();

            // Listen for events.
            this.on('resize', this.resize, this);
            this.on('ready', this.ready, this);

            this.choices.on('add', function(model, collection, data){
                this.addChoice({
                    model: model,
                    animate: true
                });
            }, this);

            this.model.on('change:selection', this.onSelectionChange, this);

            // Initialize with initial selection.
            this.onSelectionChange();
        },

        initialRender: function(){
            var content = _.template(template, {
                model: this.model,
                columns: this.columns,
                inputName: this.inputName,
                opts: this.opts
            });
            $(this.el).html(content);

            // Add controls.
            $controls = $('.controls-container .controls', this.el);
            _.each(this.opts.controls, function($control){
                $control.addClass('control');
                $controls.append($control);
            }, this);

            this.$tableContainer = $('.table-container', this.el);
            this.$choicesTable = $('.choices-table', this.el);
            this.dataTable = this.$choicesTable.dataTable(_.extend({
                sDom: 't',
                aoColumns: this.formatColumns(),
                bPaginate: false,
                bAutoWidth: false,

                // Decorate created rows.
                fnCreatedRow: function(rowEl, data, idx){
                    // Add choice id to row.
                    $(rowEl).data('id', data.id);
                    // Add 'choice-row' class.
                    $(rowEl).addClass('choice-row');
                }
            }, this.opts.tableOpts));

            this.renderChoices();
        },

        addResetButton: function(){
            this.$reset = $('<a class="control facet-reset-button" href="javascript:{}" style="visibility:hidden;">reset</a>');
            this.$reset.appendTo($('.header', this.el));
        },

        formatColumns: function(){
            // Initialize columns with hidden 
            // id column.
            var formattedColumns = [{
                bVisible: false,
                sTitle: 'id',
                mData: 'id'
            }];

            // Format remaining columns.
            _.each(this.columns, function(column){
                formattedColumns.push(column);
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
            return choiceModel.toJSON();
        },

        resize: function(){
        },

        ready: function(){
            this.resize();
        },

        onRowClicked: function(event){
            var $row = $(event.currentTarget);
            var rowId = $row.data('id');

            var selection = rowId;
            if ($row.hasClass('selected')){
                selection = null;
            }

            // Update model selection.
            this.model.set('selection', selection);
        },

        onSelectionChange: function(){
            // Deselect selected row.
            $('.choice-row.selected', this.el).removeClass('selected');

            var selection = this.model.get('selection');
            var selectionText = "";
            var selectionValue = "";
            // If there was a selection, set selected row and 
            // status text.
            if (selection != undefined){
                var choice = this.choices.get(selection);
                var $selectedRow = this.getRowById(selection);
                $selectedRow.addClass('selected');
                selectionText = choice.get(this.selectionLabelAttr);
                selectionValue = choice.get(this.selectionValueAttr);
            }
            else{
                var selectionText = "";
            }

            var $selectionTextEl = $('.header .selection > .value', this.el);
            $selectionTextEl.val(selectionText);

            $valueInput = $('.inner > input[type="hidden"]', this.el);
            $valueInput.val(selectionValue);

            this.updateResetButton();
        },

        addChoice: function(opts){
            opts = opts || {};
            var formattedChoice = this.formatChoice(opts.model);

            this.dataTable.fnAddData(formattedChoice);

            if (opts.animate){
                var $row =  this.getRowById(opts.model.id);
                $row.hide();
                $row.fadeIn(1500);
            }
        },

        getRowById: function(id){
            var $row = $('.choice-row', this.$choicesTable).filter(function() { 
                return $(this).data('id') == id;
            });
            return $row;
        },

        clearSelection: function(){
            this.model.set('selection', null);
        },

		updateResetButton: function(){
			// If anything was selected, show reset button.
            var visibility = 'hidden';
            var selection = this.model.get('selection');
            if (typeof selection != 'undefined' && selection != null){
                visibility = 'visible';
            }
            $('.reset-button', this.el).css('visibility', visibility);
		},

	});

	return TableSelectView;
});
		

