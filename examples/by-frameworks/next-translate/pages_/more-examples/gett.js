import getT from "next-translate/useTranslation";

export default function GetT({ locale }) {
  const { t } = getT(locale, "more-examples");
  const exampleWithVariable = t("example-with-variable", {
    count: 42
  });

  return (
    <>
      <Header />
      <h2>{exampleWithVariable}</h2>
    </>
  );
}
