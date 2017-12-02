(function ($) {
	/**
	 * @url https://stackoverflow.com/a/901144
	 */
	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	function isValidCharacter(character) {
		if (character.strength < 1) {
			return false;
		}
		if (character.strength > 30) {
			return false;
		}

		return true;
	}

	function isValidItem(item) {
		if (item.weight < 0) {
			return false;
		}
		if (item.quantity < 0) {
			return false;
		}

		return true;
	}

	function isValidMoney(saveData) {
		if (!saveData.money) {
			return false;
		}

		return true;
	}

	function clearItems() {
		$(".inventory__item:not(.sample)").remove();
		$("#character__score").val($("#character__score").attr("value"));
		$("#character__size-multiplier").val($("#character__size-multiplier option[selected]").attr("value"));
		$("#character__multiplier").val($("#character__multiplier option[selected]").attr("value"));
	}

	function scrollToBottom() {
		$("html, body").clearQueue();
		$("html, body").animate({scrollTop: $(document).height()});
	}

	/**
	 * Load the values from the URL query parameters or history state.
	 */
	function loadValues(saveData) {
		if (saveData) {
			clearItems();

			if (isValidCharacter(saveData)) {
				$("#character__score").val(saveData.strength);
				$("#character__size-multiplier").val(saveData.sizeMultiplier);
				$("#character__multiplier").val(saveData.multiplier);
			}

			jQuery.each(saveData.items, function (index, item) {
				var $item = addInventoryItem();
				$item.find(".inventory__item--name--field").val(item.name);
				$item.find(".inventory__item--weight--field").val(item.weight);
				$item.find(".inventory__item--quantity--field").val(item.quantity);
			});

			if (isValidMoney(saveData)) {
				$(".inventory__money--copper--field").val(saveData.money.copper);
				$(".inventory__money--silver--field").val(saveData.money.silver);
				$(".inventory__money--electrum--field").val(saveData.money.electrum);
				$(".inventory__money--gold--field").val(saveData.money.gold);
				$(".inventory__money--platinum--field").val(saveData.money.platinum);
			}
		}

		calculate();
	}

	/**
	 * Save the values to the URL query parameters and history state.
	 */
	function saveValues() {
		var saveData = {};
		saveData.strength = $("#character__score").val();
		saveData.sizeMultiplier = $("#character__size-multiplier").val();
		saveData.multiplier = $("#character__multiplier").val();
		saveData.items = [];
		saveData.money = {};

		if (!isValidCharacter(saveData)) {
			console.log("Failure to save: invalid character data.")
			return false;
		}

		$(".inventory__item:not(.sample)").each(function () {
			var $this = $(this);
			var item = {};
			item.name = $this.find(".inventory__item--name--field").val();
			item.weight = $this.find(".inventory__item--weight--field").val();
			item.quantity = $this.find(".inventory__item--quantity--field").val();

			if (isValidItem(item)) {
				saveData.items.push(item);
			}
			else {
				console.log("Unable to save item: invalid item data.");
				console.log($this);
			}
		});

		saveData.money.copper = $(".inventory__money--copper--field").val();
		saveData.money.silver = $(".inventory__money--silver--field").val();
		saveData.money.electrum = $(".inventory__money--electrum--field").val();
		saveData.money.gold = $(".inventory__money--gold--field").val();
		saveData.money.platinum = $(".inventory__money--platinum--field").val();

		var saveDataEncoded = encodeURIComponent(JSON.stringify(saveData));
		history.pushState(saveData, "", "?data=" + saveDataEncoded);
	}

	function addInventoryItem() {
		var $newRow = $(".inventory__item.sample").clone();
		$newRow.removeClass("sample");

		$newRow.find(".field").on("input change", calculate);
		$newRow.find(".field").on("focusin focusout", setActiveItem);
		$newRow.find(".inventory__item--name--field").on("keyup", updateAutocomplete);
		$newRow.find(".field:not(.active)").on("focusin", hideAutocomplete);

		$(".inventory__controls").before($newRow);

		$newRow.find(".inventory__item--name--field").focus();
		scrollToBottom();
		calculate();
		return $newRow;
	}

	function calculateCharacter() {
		var strength = $("#character__score").val();
		var sizeMultiplier = $("#character__size-multiplier option:selected").data("value");
		var multiplier = $("#character__multiplier").val();
		var capacity = strength * sizeMultiplier * multiplier;

		$("#character__capacity").val(capacity + $("#character__capacity").data("unit"));
	}

	function calculateInventory() {
		var $this = $(this);
		var weight = $this.find(".inventory__item--weight--field").val();
		var quantity = $this.find(".inventory__item--quantity--field").val();
		var subtotal = weight * quantity;

		$this.find(".inventory__item--subtotal--field").val(subtotal + $(".inventory__item--subtotal--field").data("unit"));
	}

	function calculateMoney() {
		var copper = parseInt($(".inventory__money--copper--field").val(), 10);
		var silver = parseInt($(".inventory__money--silver--field").val(), 10);
		var electrum = parseInt($(".inventory__money--electrum--field").val(), 10);
		var gold = parseInt($(".inventory__money--gold--field").val(), 10);
		var platinum = parseInt($(".inventory__money--platinum--field").val(), 10);

		copper = isNaN(copper) ? 0 : copper;
		silver = isNaN(silver) ? 0 : silver;
		electrum = isNaN(electrum) ? 0 : electrum;
		gold = isNaN(gold) ? 0 : gold;
		platinum = isNaN(platinum) ? 0 : platinum;

		var subtotal = (copper + silver + electrum + gold + platinum) / 50;
		$(".inventory__money--subtotal--field").val(subtotal + $(".inventory__money--subtotal--field").data("unit"));
	}

	function calculateTotal() {
		var capacity = parseInt($("#character__capacity").val(), 10);
		var total = 0;
		$(".inventory__item:not(.sample) .inventory__item--subtotal--field").each(function () {
			total += parseFloat(this.value);
		});
		total += parseFloat($(".inventory__money--subtotal--field").val());
		total = parseFloat(total.toFixed(2));
		$(".total__weight--field").val(total + $(".total__weight--field").data("unit"));

		var progress = total / capacity;
		var difference = capacity - total;
		difference = parseFloat(difference.toFixed(2));
		$(".total__progress--bar").width((progress * 100) + "%");
		$(".total__progress--percentage").text(Math.round(progress * 100) + "%");

		if (difference >= 0) {
			$(".total__progress--remaining").text(difference + $(".total__progress--remaining").data("unit") + " remaining");
			$(".total__progress--bar-error").width("0");
		}
		else {
			$(".total__progress--remaining").text((-1 * difference) + $(".total__progress--remaining").data("unit") + " overburdened");
			$(".total__progress--bar-error").width(((progress - 1) * 100) + "%");
		}
	}

	function calculate() {
		calculateCharacter();
		$(".inventory__item:not(.sample)").each(calculateInventory);
		calculateMoney();
		calculateTotal();
	}

	function setActiveItem() {
		var $field = $(this);
		$(".inventory__item:not(.sample).active").removeClass("active");
		$field.closest(".inventory__item:not(.sample)").addClass("active");
	}

	function removeActiveItem() {
		$(".inventory__item:not(.sample).active").remove();
		calculate();
	}

	function loadAutocompleteData(data) {
		window.itemList = data;
	}

	function generateAutocompleteList(value) {
		var results = [];

		if (window.itemList && window.itemList !== undefined) {

			for (var key in window.itemList) {
				if (window.itemList.hasOwnProperty(key)) {
					var itemId = key.toLowerCase();
					if (value === itemId.slice(0, value.length)) {
						results.push({
							"name": window.itemList[key]["name"],
							"weight": window.itemList[key]["weight"],
							"class": window.itemList[key]["class"]
						});
					}
				}
			}
		}

		return results;
	}

	function updateAutocomplete(event) {
		if (window.itemList && window.itemList !== undefined) {
			var inputValue = this.value.toLowerCase();

			if (inputValue.length > 0) {
				var results = [];
				var $resultsList = $(".autocomplete");
				$resultsList.find(".autocomplete__entry:not(.sample)").remove();

				results = generateAutocompleteList(inputValue);
				if (results.length > 0) {
					showAutocomplete();
				}
				else {
					hideAutocomplete();
				}

				for (i = 0; i < results.length; i++) {
					var $newEntry = $(".autocomplete__entry.sample").clone();
					$newEntry.removeClass("sample");

					if (results[i]["class"] && results[i]["class"] !== undefined) {
						$newEntry.addClass(results[i]["class"]);
					}
					$newEntry.find(".autocomplete__entry--name").text(results[i].name);
					$newEntry.find(".autocomplete__entry--weight").text(results[i].weight + $newEntry.find(".autocomplete__entry--weight").data("unit"));
					$resultsList.append($newEntry);
				}
			}
		}
	}

	function showAutocomplete() {
		$(this).addClass("active");
		$(".autocomplete").addClass("visible");
	}

	function hideAutocomplete() {
		$(".inventory__item--name--field").removeClass("active");
		$(".autocomplete").removeClass("visible");
	}

	function selectAutocompleteItem() {
		var $this = $(this);
		var name = $this.find(".autocomplete__entry--name").text();
		var weight = parseFloat($this.find(".autocomplete__entry--weight").text());

		var $item = $(".inventory__item.active");
		$item.find(".inventory__item--name--field").val(name);
		$item.find(".inventory__item--weight--field").val(weight);

		hideAutocomplete();
		$item.find(".inventory__item--quantity--field").focus();
	}

	$(window).on("load onpopstate", function (event) {
		if (event && event.state) {
			loadValues(event.state);
		}
		else {
			console.log("Failed to load stored data from history state.");

			var saveData = getParameterByName("data");
			if (saveData) {
				loadValues(JSON.parse(saveData));
			}
			else {
				console.log("Failed to load stored data from URL query parameters.");
			}
		}
	});

	$(document).ready(function () {
		loadValues();
		$.getJSON("data.json").done(loadAutocompleteData);

		$(".field").on("input change", calculate);
		$(".field").on("focusin focusout", setActiveItem);
		$(".inventory__item--name--field").on("keyup", updateAutocomplete);
		$(".field:not(.active)").on("focusin", hideAutocomplete);
		$(".autocomplete").on("click", ".autocomplete__entry", selectAutocompleteItem);

		$(".inventory__controls--add-row").on("click submit", addInventoryItem);
		$(".inventory__controls--remove-row").on("click submit", removeActiveItem);
		$(".inventory__controls--save").on("click submit", saveValues);

		calculate();
	});
})(jQuery);
