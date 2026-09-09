import Link from "next/link";
import { COURSE_LABEL } from "@/lib/types";
import type { Recipe } from "@/lib/types";

export function RecipeIndexCard({ recipe }: { recipe: Recipe }) {
  return (
    <article className="index-card">
      <p className="tab">{COURSE_LABEL[recipe.course]}</p>
      <h2>
        <Link href={`/recipes/${recipe.id}`}>{recipe.title}</Link>
      </h2>
      <p className="from">From the kitchen of {recipe.fromWhom}</p>
      {recipe.story ? <p className="story">{recipe.story}</p> : null}
    </article>
  );
}
