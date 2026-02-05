import MuiButton from '@mui/material/Button';
import MuiLink from '@mui/material/Link';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import { ReactNode } from 'react';

const useStyles = makeStyles(() => ({
  baseAnchor: {
    display: 'block',
    color: 'inherit',
    textDecoration: 'none',
  },
}));

// Exportierbarer Typ für externe Nutzung
export type LinkProps = {
  children: ReactNode;
  href?: string;
  as?: string;
  target?: string;
  dropUrlParams?: boolean;
  className?: string;
  withoutMaterial?: boolean;
  underline?: boolean;
  onClick?: () => any;
  isButton?: boolean;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  color?: any;
  startIcon?: any;
  endIcon?: any;
  urlParams?: string;
  title?: string;
} & Partial<NextLinkProps>;

export const Link = (props: LinkProps) => {
  const {
    dropUrlParams,
    className,
    children,
    withoutMaterial,
    underline,
    onClick,
    isButton = false,
    variant,
    size,
    color,
    startIcon,
    endIcon,
    urlParams = '',
    title,
  } = props;

  const router = useRouter();
  let href = props.href || '';
  let { as } = props;

  // URL-Parameter anhängen
  if (!dropUrlParams && router) {
    const urlQuerystring = router.asPath.split('?')[1];
    if (urlQuerystring) {
      href += href.includes('?') ? `&${urlQuerystring}` : `?${urlQuerystring}`;
    }
  }

  if (urlParams) {
    const parsedUrlParams = queryString.parse(urlParams);
    const parsedHref = queryString.parseUrl(href);
    href = queryString.stringifyUrl({
      ...parsedHref,
      query: { ...parsedHref.query, ...parsedUrlParams },
    });

    if (as) {
      const parsedAs = queryString.parseUrl(as);
      as = queryString.stringifyUrl({
        ...parsedAs,
        query: { ...parsedAs.query, ...parsedUrlParams },
      });
    }
  }

  const classes = useStyles();
  const external = href.startsWith('http://') || href.startsWith('https://');
  const underlineStyle = underline ? 'always' : 'none';

  // Kein href → nur children rendern
  if (!href) return <>{children}</>;

  // Ohne Material
  if (withoutMaterial) {
    return (
      <NextLink href={href} as={as} className={clsx(classes.baseAnchor, className)} title={title}>
        {children}
      </NextLink>
    );
  }

  // Externe Links
  if (external) {
    return isButton ? (
      <MuiButton
        href={href}
        className={className}
        color={color}
        onClick={onClick}
        variant={variant}
        size={size}
        startIcon={startIcon}
        endIcon={endIcon}
        title={title}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </MuiButton>
    ) : (
      <MuiLink
        href={href}
        className={className}
        underline={underlineStyle}
        color={color}
        onClick={onClick}
        title={title}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </MuiLink>
    );
  }

  // Interne Links
  if (isButton) {
    return (
      <MuiButton
        component={NextLink}
        href={href}
        className={className}
        color={color}
        onClick={onClick}
        variant={variant}
        size={size}
        startIcon={startIcon}
        endIcon={endIcon}
        title={title}
      >
        {children}
      </MuiButton>
    );
  }

  return (
    <MuiLink
      component={NextLink}
      href={href}
      className={className}
      underline={underlineStyle}
      color={color}
      onClick={onClick}
      title={title}
    >
      {children}
    </MuiLink>
  );
};
