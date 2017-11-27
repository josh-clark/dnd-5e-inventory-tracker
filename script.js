(function ($) {
	function loadValues() {
		// Load the values from the URL query parameters.
	}

	function saveValues() {
		// Load the values to the URL query parameters.
	}

	function addInventoryItem() {
		var $newRow = $(".inventory__item.sample").clone();
		$newRow.removeClass("sample");
		$newRow.find(".field").on("input change", calculate);
		$(".inventory__controls").before($newRow);
		calculate();
	}

	function calculateCharacter() {
		var strength = $("#character__score").val();
		var sizeMultiplier = $("#character__size-multiplier").val();
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
		saveValues();
	}

	$(document).ready(function () {
		loadValues();
		$(".field").on("input change", calculate);
		$(".inventory__controls--add-row").on("click submit", addInventoryItem);
		calculate();
	});
})(jQuery);
