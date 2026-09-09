import type { Recipe } from "./types";

type Sample = Omit<Recipe, "id" | "householdId" | "createdByMemberId" | "createdAt" | "updatedAt">;

export const SAMPLE_CARDS: Sample[] = [
  {
    title: "Tuesday beans",
    fromWhom: "Aunt Jo",
    course: "mains",
    story: "The pot that went on after school. Nobody measured. This is as close as the table remembers.",
    servings: "4 bowls",
    ingredients: [
      "2 cups dried pinto beans, soaked overnight",
      "1 onion, chopped",
      "3 garlic cloves",
      "1 smoked ham hock or a spoon of smoked paprika",
      "Salt at the end, not the start"
    ],
    steps: [
      "Drain the beans. Cover with fresh water by two inches.",
      "Add onion, garlic, and the hock or paprika.",
      "Simmer until the beans give, about 90 minutes. Add water if they look thirsty.",
      "Salt only when they are soft. Eat with bread that can take the juice."
    ],
    notes: "Sample card so the box is not empty. Replace it with yours."
  },
  {
    title: "Pan bread",
    fromWhom: "Dad",
    course: "sides",
    story: "Cast iron. No yeast. The one you make when the loaf is gone and people are already sitting down.",
    servings: "1 skillet",
    ingredients: [
      "2 cups flour",
      "2 teaspoons baking powder",
      "1 teaspoon salt",
      "1 cup milk",
      "2 tablespoons fat in the pan"
    ],
    steps: [
      "Heat the skillet until a drop of water skitters.",
      "Stir flour, powder, salt, then milk. Thick batter, not a pour.",
      "Fat in the pan. Batter in. Cover. Six minutes. Flip. Four more.",
      "Cut into wedges at the table. Butter if you have it."
    ],
    notes: "Sample card. The real one lives in someone's head until you write it."
  },
  {
    title: "Lemon sink cake",
    fromWhom: "Nana",
    course: "sweets",
    story: "Named because the glaze should run. If it sits politely on top, you were too shy with the lemon.",
    servings: "One loaf tin",
    ingredients: [
      "1 cup sugar",
      "1/2 cup butter, soft",
      "2 eggs",
      "1 1/2 cups flour",
      "1 teaspoon baking powder",
      "Zest and juice of 2 lemons",
      "1/2 cup more sugar for the sink"
    ],
    steps: [
      "Heat the oven to 175°C / 350°F. Butter the tin.",
      "Beat sugar and butter. Eggs one at a time. Flour, powder, zest.",
      "Bake until a knife comes out with crumbs, about 40 minutes.",
      "Mix juice with the extra sugar. Poke the hot cake. Pour. Let it sink."
    ],
    notes: "Sample card. Keep Nana's spelling if you have it."
  }
];
