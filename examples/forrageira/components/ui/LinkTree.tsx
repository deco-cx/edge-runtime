/** @jsxImportSource preact */

import { Image as LiveImage } from "deco-sites/std/components/types.ts";
import Icon from "deco-sites/forrageira/components/ui/Icon.tsx";
import Text from "deco-sites/forrageira/components/ui/Text.tsx";
export interface Link {
  label: string;
  href: string;
}

export interface Social {
  label: "Instagram" | "Facebook" | "YouTube";
  href: string;
}

export interface Props {
  title?: string;
  description?: string;
  links?: Link[];
  avatar?: LiveImage;
  social?: Social[];
}

function LinkTree({
  avatar,
  title = "",
  description = "",
  links,
  social,
}: Props) {
  return (
    <div class="flex flex-col justify-start items-center gap-2 px-4 pb-4 overflow-y-hidden">
      <header class="flex flex-col justify-center items-center gap-4">
        {avatar &&
          <img src={avatar} width={150} height={150} />}
        <Text variant="heading-3">{title}</Text>
        <Text variant="body" class="text-justify">{description}</Text>
      </header>
      <main class="w-full max-w-[80%] sm:max-w-[50%]">
        <ul class="flex flex-col justify-center items-center gap-4">
          {links?.map((link) => (
            <li class="w-full">
              <a
                href={link.href}
                class="text-caption rounded-3xl text-center w-full flex justify-center items-center min-h-[36px] hover:(bg-interactive-inverse text-interactive) border border-default"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </main>
      <section>
        <ul class="flex flex-row">
          {social?.map((link) => (
            <li>
              <a
                href={link.href}
                class="block rounded"
              >
                <Icon id={link.label} size={36} strokeWidth={0.8} />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default LinkTree;
