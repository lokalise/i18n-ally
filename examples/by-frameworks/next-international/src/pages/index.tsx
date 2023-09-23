import { useI18n, useScopedI18n } from "../locales";

export default function Page() {
  const t = useI18n();
  const scopedT = useScopedI18n("hello");

  return (
    <div>
      <p>{t("hello")}</p>

      {/* Both are equivalent: */}
      <p>{t("hello.world")}</p>
      <p>{scopedT("world")}</p>

      <p>{t("welcome", { name: "John" })}</p>
      <p>{t("welcome", { name: <strong>John</strong> })}</p>
      <Child />
    </div>
  );
}

const Child = () => {
  const scopedT = useScopedI18n("child");

  return <p>{scopedT("hello")}</p>;
};
