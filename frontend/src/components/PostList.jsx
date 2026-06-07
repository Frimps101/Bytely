import InfiniteScroll from 'react-infinite-scroll-component';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';

const fetchPosts = async (pageParam, searchParams) => {
    const searchParamsObject = Object.fromEntries([...searchParams]);

    console.log(searchParamsObject);

    const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts`, {
    params: { page: pageParam, limit: 10, ...searchParamsObject },
  });
  return res.data;
}

const PostList = () => {

    const [searchParams, setSearchParams] = useSearchParams();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status
    } = useInfiniteQuery({
        queryKey: ["posts", searchParams.toString()],
        queryFn: ({ pageParam = 1}) => fetchPosts(pageParam, searchParams),
        initialPageParam: 1,
        getNextPageParam: (lastPage, pages) => {
            lastPage.hasMore ? pages.length + 1 : undefined
        }
    });

    if(error) return <p>Error: {error.message}</p>;

    const allPosts = data?.pages.flatMap(page => page.posts) || [];
    return(
        <InfiniteScroll
        dataLength={data?.pages.length || 0}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<h4>Loading...</h4>}
        endMessage={<p>You have reached the end</p>}
        >
            {allPosts.map((post) => {
                <PostListItem key={post.id} post={post} />
            })}
        </InfiniteScroll>
    )
}

export default PostList;