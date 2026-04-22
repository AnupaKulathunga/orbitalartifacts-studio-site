import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";

/**
 * Brand typography mapping applied to every .mdx file in the project.
 * Anupa writes markdown; these wrappers give the prose the Fraunces
 * heads / Archivo body / rust links look without her touching any JSX.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children, ...props }) => (
      <h2
        className="mt-20 font-serif text-3xl leading-[1.1] text-ink sm:text-4xl"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className="mt-10 font-serif text-xl leading-[1.2] text-ink sm:text-2xl"
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p
        className="mt-5 font-sans text-base leading-[1.75] text-ink-2"
        {...props}
      >
        {children}
      </p>
    ),
    a: ({ href = "", children, ...props }) => {
      const external = /^https?:/i.test(href);
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-rust underline-offset-4 transition-opacity hover:opacity-75 hover:underline"
            {...props}
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          href={href}
          className="text-rust underline-offset-4 transition-opacity hover:opacity-75 hover:underline"
        >
          {children}
        </Link>
      );
    },
    ul: ({ children, ...props }) => (
      <ul
        className="mt-5 flex list-disc flex-col gap-2 pl-6 font-sans text-base leading-[1.7] text-ink-2 marker:text-rust"
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol
        className="mt-5 flex list-decimal flex-col gap-2 pl-6 font-sans text-base leading-[1.7] text-ink-2 marker:text-rust"
        {...props}
      >
        {children}
      </ol>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="mt-10 border-l-2 border-rust pl-6 font-serif text-xl italic leading-[1.5] text-ink sm:text-2xl"
        {...props}
      >
        {children}
      </blockquote>
    ),
    em: ({ children }) => (
      <em className="italic text-ink">{children}</em>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-ink">{children}</strong>
    ),
    hr: () => (
      <hr className="mt-16 border-t border-sand/40" />
    ),
    img: (props) => {
      const { src = "", alt = "", width, height, ...rest } = props as ImageProps;
      return (
        <span className="mt-10 block">
          <Image
            src={src}
            alt={alt}
            width={Number(width) || 1600}
            height={Number(height) || 1000}
            className="h-auto w-full bg-paper-2"
            {...rest}
          />
        </span>
      );
    },
    ...components,
  };
}
