package com.feedforward.enums;

public enum FoodCategory {
    COOKED_RICE("Cooked Rice", "🍚"),
    CURRIES("Curries & Gravies", "🍛"),
    VEGETABLES("Vegetables", "🥗"),
    BREAD("Bread & Roti", "🍞"),
    PROTEINS("Proteins", "🍗"),
    MIXED_MEALS("Mixed Meals", "🥘"),
    SWEETS("Sweets & Desserts", "🍰"),
    FRUITS("Fruits", "🍎"),
    BEVERAGES("Beverages", "🥤"),
    SNACKS("Snacks", "🍿"),
    OTHER("Other", "📦");

    private final String displayName;
    private final String emoji;

    FoodCategory(String displayName, String emoji) {
        this.displayName = displayName;
        this.emoji = emoji;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getEmoji() {
        return emoji;
    }
}


