/**
 * Dropsy Version 0.9.1
 *
 * TODO: adding multiple select
 *
 */

;(function($, window, document, undefined) {
	var pluginName = 'dropsy',
		defaults = {
			wrapperId: 'dropsy-wrap',
			wrapperClass: 'dropsy-wrap',
			//mobileDefault: false,			// set to true if you want the default select on mobile devices
			animationType: 'pop',			// available values are: slide, pop, fade
			type: 'single',					// single or multiple selection
		};
		
	function Dropsy(element, options, index) {
		this.elm = element;
		this.options = $.extend({}, defaults, options);
		this.index = index;
		this.init();
	}
	
	Dropsy.prototype.init = function() {
		// create the template
		createTemplate(this.index, this.elm, this.options);

		// create the list
		createList(this.index, this.elm, this.options);

		// set the events
		setEvents(this.index, this.elm, this.options);
	};

	// === create tempate function ===
	function createTemplate(index, _this, options) {
		var template = '';

		if(options.type == 'single') {
			template = ''+
			'<div id="'+options.wrapperId+'-'+index+'" class="'+options.wrapperClass+' dropsy-'+options.animationType+'">'+
				'<div class="dropsy-hide-me"></div>'+
				'<div class="dropsy-select">'+
					'<div class="dropsy-label"><span class="dropsy-label-text"></span><i class="dropsy-label-arrow"></i></div>'+
					'<div class="dropsy-list-wrap">'+
						'<ul class="dropsy-list"></ul>'+
					'</div>'+
				'</div>'+
			'</div>';
		} /*else if(options.type == 'multiple') {
			template = ''+
			'<div id="'+options.wrapperId+'-'+index+'" class="'+options.wrapperClass+' dropsy-'+options.animationType+'">'+
				'<div class="dropsy-hide-me"></div>'+
				'<div class="dropsy-select">'+
					'<div class="dropsy-label"><span class="dropsy-label-text"></span><i class="dropsy-label-arrow"></i></div>'+
					'<div class="dropsy-list-wrap">'+
						'<i class="dropsy-list-arrow"></i>'+
						'<ul class="dropsy-list"></ul>'+
					'</div>'+
				'</div>'+
			'</div>';
		}*/
		
		// append template after current SELECT
		$(_this).after(template);
		
		var _parent = $('#'+options.wrapperId+'-'+index);
		
		// move current SELECT in template
		_parent.find('.dropsy-hide-me').append($(_this));
		
		// update label text
		_parent.find('.dropsy-label').find('span').text();

		// add properties from select to dropsy
		if($(_this).prop('disabled') == true) {
			_parent.addClass('dropsy-disabled');
		}
	}


	// === create list function ===
	function createList(index, _this, options) {
		var _parent = $('#'+options.wrapperId+'-'+index);

		_parent.data('open', false);
		
		$(_this).find('option').each(function() {
			if($(this).prop('selected') == true) {
				var listItem = '<li data-value="'+$(this).val()+'" class="selected">'+$(this).text()+'</li>';
			} else {
				var listItem = '<li data-value="'+$(this).val()+'">'+$(this).text()+'</li>';
			}
			_parent.find('.dropsy-list').append(listItem);
		});
		
		_parent.find('.dropsy-label').find('.dropsy-label-text').text(_parent.find('li.selected').text());
	}


	// === close list ===
	function closeList(options) {
		$('.'+options.wrapperClass).each(function() {
			$(this).removeClass('dropsy-open');
			$(this).data('open', false);
		});
	}


	// === open list ===
	function openList(_parent) {
		_parent.addClass('dropsy-open');
		_parent.data('open', true);
	}


	// === set events function ===
	function updateValue(_parent, elm) {
		var value = $(elm).attr('data-value');

		_parent.find('option').each(function() {
			// set property of OPTION to none
			$(this).prop('selected', '');

			if($(this).val() == value) {
				// set value of SELECT to value of clicked LI
				$(this).parent().val(value);

				// set property of OPTION with same value as clicked LI to "selected"
				$(this).prop('selected', 'selected');
			}
		});
	}


	// === set events function ===
	function setEvents(index, _this, options) {
		var _parent = $('#'+options.wrapperId+'-'+index);
		var _list = _parent.find('.dropsy-list-wrap');

		// show dropdown
		_parent.on('click', '.dropsy-label', function() {
			if(_parent.hasClass('dropsy-disabled') == false) {
				if(_parent.hasClass('dropsy-open') == true) {
					closeList(options);
				} else {
					closeList(options);
					openList(_parent);

					/*if(options.animationType == 'pop') {
					 _parent.addClass('dropsy-open');
					 } else if(options.animationType == 'slide') {
					 openList(_parent);
					 }*/
				}
			}
		});

		// close all selects when clicked on document
		$(document).on('click', function(e) {
			if(!$(e.target).closest('.'+options.wrapperClass).length) {
				closeList(options);
			}
		});

		// options event
		_parent.on('click', 'li', function(e) {
			e.preventDefault();
			updateValue(_parent, $(this));
			updateDropsy(_this, _parent);
			closeList(options);
		});
		
		// update dropsy on select change
		_parent.on('change', 'select', function(e) {
			updateDropsy(_this, _parent);
		});
	}

	
	// === update dropsy function ===
	function updateDropsy(_this, _parent) {
		// get value of SELECT
		var value = $(_this).val();
		
		// get text of selected OPTION
		var text = $(_this).find('option:selected').text();

		// remove and add selected-class from/to LIs
		_parent.find('li').each(function() {
			$(this).removeClass('selected');
			if($(this).attr('data-value') == value) {
				$(this).addClass('selected');
			}
		});
		
		// fill dropsy label width current value
		_parent.find('.dropsy-label').find('.dropsy-label-text').text(text);

		// adds or removes disabled class
		if($(_this).prop('disabled') == true) {
			_parent.addClass('dropsy-disabled');
		} else {
			_parent.removeClass('dropsy-disabled');
		}
	}
	
	$.fn[pluginName] = function(options) {
		return this.each(function(index) {
			if(!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Dropsy(this, options, index));
			}
		});
	}
})(jQuery, window, document);