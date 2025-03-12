import { JSX, HTMLAttributes } from "react";

export function FilledStar(props: HTMLAttributes<SVGAElement>): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="800px"
      height="800px"
      viewBox="0 0 24 24"
      id="star_filled"
      data-name="star filled"
      className={props.className}
    >
      <rect
        id="Rectangle_4"
        data-name="Rectangle 4"
        width="24"
        height="24"
        fill="none"
      />
      <path
        id="Star"
        d="M10,15,4.122,18.09l1.123-6.545L.489,6.91l6.572-.955L10,0l2.939,5.955,6.572.955-4.755,4.635,1.123,6.545Z"
        transform="translate(2 3)"
        stroke="#000000"
        strokeMiterlimit="10"
        strokeWidth="1.5"
      />
    </svg>
  );
}
