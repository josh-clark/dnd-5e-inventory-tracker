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
		if (!([0.5, 1, 2, 4, 8].indexOf(character.sizeMultiplier) > -1)) {
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
		if (saveData && isValidCharacter(saveData)) {
			clearItems();

			$("#character__score").val(saveData.strength);
			$("#character__size-multiplier").val($("#character__size-multiplier option[data-value='" + saveData.sizeMultiplier + "']").val());
			$("#character__multiplier").val(saveData.multiplier);

			jQuery.each(saveData.items, function (index, item) {
				var $item = addInventoryItem();
				$item.find(".inventory__item--name--field").val(item.name);
				$item.find(".inventory__item--weight--field").val(item.weight);
				$item.find(".inventory__item--quantity--field").val(item.quantity);
			});
		}

		calculate();
	}

	/**
	 * Save the values to the URL query parameters and history state.
	 */
	function saveValues() {
		var saveData = {};
		saveData.strength = $("#character__score").val();
		saveData.sizeMultiplier = $("#character__size-multiplier option:selected").data("value");
		saveData.multiplier = $("#character__multiplier").val();
		saveData.items = [];

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

		var saveDataEncoded = encodeURIComponent(JSON.stringify(saveData));
		history.pushState(saveData, "", "?data=" + saveDataEncoded);
	}

	function addInventoryItem() {
		var $newRow = $(".inventory__item.sample").clone();
		$newRow.removeClass("sample");
		$newRow.find(".field").on("input change", calculate);
		$(".inventory__controls").before($newRow);

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

	function calculateTotal() {
		var capacity = parseInt($("#character__capacity").val(), 10);
		var total = 0;
		$(".inventory__item:not(.sample) .inventory__item--subtotal--field").each(function () {
			total += parseInt(this.value, 10);
		});
		$(".total__weight--field").val(total + $(".total__weight--field").data("unit"));

		var progress = total / capacity;
		var difference = capacity - total;
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
		calculateTotal();
	}

	$(window).on("load onpopstate", function (event) {
		if (event && event.state) {
			loadValues(event.state);
		}
		else {
			console.log("Failed to load stored data from history state.");

			var saveData = getParameterByName("data");
			console.log(saveData);
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
		$(".field").on("input change", calculate);
		$(".inventory__controls--add-row").on("click submit", addInventoryItem);
		$(".inventory__controls--save").on("click submit", saveValues);
		calculate();
	});
})(jQuery);
