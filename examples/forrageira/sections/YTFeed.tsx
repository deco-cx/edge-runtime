/** @jsxImportSource preact */

export interface Video {
  url: string;
  title?: string;
}

export interface FeedProps {
  videos: Video[];
}
export default function YTFeed(props: FeedProps) {
  const columns = 3;
  const classes = ["pl-4", "px-4", "pr-4"];
  return (
    <div class="flex flex-wrap h-screen">
      {props.videos.map((video, i) => (
        <div
          key={video.url}
          class={`xl:w-1/${columns} w-full xl:${
            classes[i % columns]
          } px-4 xl:px-0 pb-4`}
        >
          <iframe
            width="100%"
            height="100%"
            src={video.url}
            title={video.title ?? "YouTube video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          >
          </iframe>
        </div>
      ))}
    </div>
  );
}
