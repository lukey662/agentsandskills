import { COURSES, COURSE_LABEL, type Course, type Recipe } from "@/lib/types";
import { SubmitButton } from "@/components/submit-button";

export function RecipeForm({
  action,
  recipe,
  error
}: {
  action: (formData: FormData) => Promise<void>;
  recipe?: Recipe;
  error: string | null;
}) {
  const course = recipe?.course ?? "mains";
  return (
    <form action={action} className="card-form">
      {error ? (
        <p className="banner" role="alert">
          {error}
        </p>
      ) : null}
      <label>
        Recipe name
        <input name="title" required maxLength={120} defaultValue={recipe?.title ?? ""} autoComplete="off" />
      </label>
      <label>
        From the kitchen of
        <input name="fromWhom" required maxLength={80} defaultValue={recipe?.fromWhom ?? ""} autoComplete="name" />
      </label>
      <fieldset>
        <legend>Section</legend>
        <div className="course-picks">
          {COURSES.map((value) => (
            <label key={value} className="choice">
              <input type="radio" name="course" value={value} defaultChecked={course === value} />
              {COURSE_LABEL[value as Course]}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        Servings
        <input name="servings" maxLength={40} defaultValue={recipe?.servings ?? ""} placeholder="A pot, 6 plates…" />
      </label>
      <label>
        The story
        <textarea name="story" rows={3} maxLength={800} defaultValue={recipe?.story ?? ""} placeholder="Whose card. When it hits the table." />
      </label>
      <label>
        Ingredients, one per line
        <textarea name="ingredients" required rows={8} defaultValue={recipe?.ingredients.join("\n") ?? ""} />
      </label>
      <label>
        Method, one step per line
        <textarea name="steps" required rows={8} defaultValue={recipe?.steps.join("\n") ?? ""} />
      </label>
      <label>
        Notes
        <textarea name="notes" rows={2} maxLength={800} defaultValue={recipe?.notes ?? ""} />
      </label>
      <SubmitButton pendingLabel="Saving card…">{recipe ? "Save card" : "Put it in the box"}</SubmitButton>
    </form>
  );
}
