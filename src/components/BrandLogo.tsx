/** ELANJAI pin mark — image fill on a rounded tile (design "logo_mark"). */
export default function BrandLogo({
  size = 34,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static asset
    <img
      src="/elanjai-logo.png"
      alt="Elanjai FM"
      width={size}
      height={size}
      className={`rounded-[30%] shadow-md shadow-brand/20 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
