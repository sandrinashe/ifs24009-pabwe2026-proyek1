import { ref, type Ref } from "vue";

export function useInput(
  initial = ""
): [Ref<string>, (event: Event) => void, () => void] {
  const value = ref(initial);
  const onChange = (event: Event) => {
    value.value = (event.target as HTMLInputElement).value;
  };
  const reset = () => {
    value.value = initial;
  };
  return [value, onChange, reset];
}
