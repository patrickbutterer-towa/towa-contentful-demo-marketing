import Menu from '@mui/icons-material/Menu';
import { AppBar, Container, IconButton, Toolbar, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'next-i18next';
import NextLink from 'next/link';

import { CtfNavigationGql } from '@src/components/features/ctf-components/ctf-navigation/ctf-navigation-gql';
import { HEADER_HEIGHT, HEADER_HEIGHT_MD, CONTAINER_WIDTH } from '@src/theme';

const useStyles = makeStyles(theme => ({
  appbar: {
    boxShadow: '0 2px 6px #00000021',
  },
  toolbar: {
    height: HEADER_HEIGHT_MD,
    [theme.breakpoints.up('md')]: {
      height: HEADER_HEIGHT,
    },
  },
  toolbarContent: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'space-between',
  },
  menuWrapper: {
    alignItems: 'center',
    display: 'flex',
  },
  corporateLogo: {
    display: 'block',
    height: 'auto',
    width: '113px',
  },
}));

interface HeaderPropsInterface {
  isMenuOpen?: boolean;
  onMenuClick?: () => any;
}

export const Header = ({ onMenuClick, isMenuOpen }: HeaderPropsInterface) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <AppBar position="sticky" color="secondary" className={classes.appbar}>
      <Toolbar className={classes.toolbar}>
        <Container
          className={classes.toolbarContent}
          disableGutters
          maxWidth={false}
          style={{ maxWidth: `${CONTAINER_WIDTH / 10}rem` }}
        >
          {/* Next.js 13+ Link direkt nutzen */}
          <NextLink href="/" title={t('common.homepage')}>
            <img src="icons/colorful-coin-logo.svg" alt="Logo" className={classes.corporateLogo} />
          </NextLink>

          {/* Navigation (nur ab md) */}
          <Box display={{ xs: 'none', md: 'block' }}>
            <div className={classes.menuWrapper}>
              <CtfNavigationGql />
            </div>
          </Box>
        </Container>

        {/* Mobile Menu Button */}
        <Box display={{ md: 'none' }}>
          <IconButton
            title={t('navigation.mobileMenuButton')}
            onClick={() => onMenuClick?.()}
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
            aria-haspopup="dialog"
          >
            <Menu />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
