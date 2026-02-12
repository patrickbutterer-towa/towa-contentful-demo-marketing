import { dehydrate, QueryClient } from '@tanstack/react-query';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { useCtfFooterQuery } from '@src/components/features/ctf-components/ctf-footer/__generated/ctf-footer.generated';
import { useCtfNavigationQuery } from '@src/components/features/ctf-components/ctf-navigation/__generated/ctf-navigation.generated';
import { useCtfPageQuery } from '@src/components/features/ctf-components/ctf-page/__generated/ctf-page.generated';
import CtfPageGgl from '@src/components/features/ctf-components/ctf-page/ctf-page-gql';
import { ComponentReferenceFieldsFragment } from '@src/lib/__generated/graphql.types';
import { getServerSideTranslations } from '@src/lib/get-serverside-translations';
import { prefetchMap, PrefetchMappingTypeFetcher } from '@src/lib/prefetch-mappings';
import { prefetchPromiseArr } from '@src/lib/prefetch-promise-array';

const SlugPage: NextPage<{ pageMissing?: boolean }> = ({ pageMissing }) => {
  const router = useRouter();
  const slug = (router?.query.slug as string) || '';

  if (pageMissing) return <div>Seite aktuell nicht verfügbar</div>;

  return <CtfPageGgl slug={slug} />;
};

export interface CustomNextPageContext {
  params: { slug: string };
  locale: string;
  query: { preview?: string };
}

export const getServerSideProps = async ({ locale, params, query }: CustomNextPageContext) => {
  const slug = params.slug;
  const isPreview: boolean =
    query.preview === 'true' || // nur 'true' aktiviert Preview
    (!!process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN && process.env.NODE_ENV !== 'production');

  try {
    const queryClient = new QueryClient();

    // Prefetch default queries
    const prefetchPromises = [
      queryClient.prefetchQuery(
        useCtfPageQuery.getKey({ slug, locale, preview: isPreview }),
        useCtfPageQuery.fetcher({ slug, locale, preview: isPreview }),
      ),
      queryClient.prefetchQuery(
        useCtfNavigationQuery.getKey({ locale, preview: isPreview }),
        useCtfNavigationQuery.fetcher({ locale, preview: isPreview }),
      ),
      queryClient.prefetchQuery(
        useCtfFooterQuery.getKey({ locale, preview: isPreview }),
        useCtfFooterQuery.fetcher({ locale, preview: isPreview }),
      ),
    ];

    // Fetch main page
    const pageData = await useCtfPageQuery.fetcher({ slug, locale, preview: isPreview })();
    const page = pageData.pageCollection?.items[0];

    if (!page || !page.pageContent) {
      // Production: Seite fehlt → Platzhalter rendern
      if (!isPreview) {
        return {
          props: {
            ...(await getServerSideTranslations(locale)),
            dehydratedState: dehydrate(queryClient),
            pageMissing: true,
          },
        };
      }

      // Lokal: Preview → 404
      return { notFound: true };
    }

    const topSection = page?.topSectionCollection?.items;
    const extraSection = page?.extraSectionCollection?.items;
    const content: ComponentReferenceFieldsFragment | undefined | null = page?.pageContent;

    await Promise.all([
      ...prefetchPromises,
      ...prefetchPromiseArr({ inputArr: topSection, locale, queryClient }),
      ...prefetchPromiseArr({ inputArr: extraSection, locale, queryClient }),
      ...prefetchPromiseArr({ inputArr: [content], locale, queryClient }),
    ]);

    if (content) {
      const { __typename, sys } = content;

      const query = prefetchMap?.[__typename];
      if (query) {
        const data: PrefetchMappingTypeFetcher = await query.fetcher({
          id: sys.id,
          locale,
          preview: isPreview,
        })();
        const inputArr = (() => {
          if ('topicBusinessInfo' in data)
            return data?.topicBusinessInfo?.body?.links.entries.block;
          if ('topicPerson' in data) return [data?.topicPerson];
          if ('topicProduct' in data) return [data?.topicProduct];
          return [];
        })();
        await Promise.all([...prefetchPromiseArr({ inputArr, locale, queryClient })]);
      }
    }

    return {
      props: {
        ...(await getServerSideTranslations(locale)),
        dehydratedState: dehydrate(queryClient),
      },
    };
  } catch (err) {
    console.error(err);

    // Production: Seite fehlt → Platzhalter rendern
    return {
      props: {
        ...(await getServerSideTranslations(params.slug)),
        dehydratedState: dehydrate(new QueryClient()),
        pageMissing: true,
      },
    };
  }
};

export default SlugPage;
