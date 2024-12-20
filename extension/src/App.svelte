<script lang="ts">
  import { nullMiniProfile, type MiniProfile } from "./lib/bsky/utils";
  import { keyFromTab } from "./lib/dns";
  import { mainHandler } from "./lib/handlers";

  let title = $state("No Bsky profile detected.");
  let profileUrl = $state("");
  let miniProfileData: MiniProfile = $state(nullMiniProfile);
  let shouldDisplayProfile = $state(false);

  function handleLink(link: string) {
    const opts = {
      url: link,
    };
    chrome.tabs.create(opts);
  }

  $effect(() => {
    (async () => {
      miniProfileData = (await mainHandler()) ?? nullMiniProfile;
      if (miniProfileData.handle !== null) {
        title = miniProfileData.handle;
        shouldDisplayProfile = true;
        profileUrl = `https://bsky.app/profile/${miniProfileData.handle}`;
      } else {
        const hostname = await keyFromTab();
        title = `${hostname} doesn't have a profile on bsky.app`;
        shouldDisplayProfile = false;
      }
    })();
  });
</script>

<main
  class="w-[20rem] min-h-[30rem] bg-black text-slate-300 flex flex-col justify-start items-center overflow-hidden"
>
  {#if shouldDisplayProfile && miniProfileData.banner !== null}
    <img
      src={miniProfileData.banner}
      alt="{miniProfileData.displayName ?? miniProfileData.handle}'s banner"
      class="w-full h-56 object-cover"
    />
  {/if}

  {#if shouldDisplayProfile}
    <div class="relative">
      <div class="backdrop"></div>
      <div class="backdrop-edge"></div>

      <div
        class="relative px-14 pb-24 z-50 {miniProfileData.banner
          ? '-mt-10'
          : 'pt-14'} flex flex-col justify-center items-center gap-y-4 h-full"
      >
        <div
          class="flex flex-col justify-center {miniProfileData.description
            ? 'items-start'
            : 'items-center'} gap-y-1 text-slate-400"
        >
          <button onclick={() => handleLink(profileUrl)} class="relative">
            <img
              src={miniProfileData.avatar}
              alt="{miniProfileData.displayName ??
                miniProfileData.handle} profile"
              class="w-20 h-20 rounded-full border-2 border-slate-300 hover:border-blue-500"
            />
          </button>
          <h1 class="text-2xl font-semibold text-slate-200">
            {miniProfileData.displayName}
          </h1>
          <button
            class="hover:text-blue-500 hover:underline"
            onclick={() => handleLink(profileUrl)}
          >
            <h2 class="{miniProfileData.displayName ? '' : 'mt-2'} text-base">
              @{miniProfileData.handle}
            </h2>
          </button>
          <p class="text-sm">{miniProfileData.description}</p>
        </div>

        <button
          class="bg-blue-500 text-blue-200 rounded-full w-full min-h-10 py-2 border border-blue-200 hover:border-blue-800 text-center font-mono font-semibold hover:bg-blue-300 hover:text-blue-800 px-4 text-balance"
        >
          follow <span class="whitespace-nowrap"
            >{miniProfileData.displayName ?? miniProfileData.handle}</span
          > on bluesky
        </button>
      </div>
    </div>
  {:else}
    <div class="p-20">
      <h3 class="text-lg">{title}</h3>
    </div>
  {/if}
</main>

<style>
  .backdrop {
    position: absolute;
    inset: 0;
    height: 200%;
    transform: translateY(-50%);
    backdrop-filter: blur(18px) brightness(150%) saturate(160%);
    mask-image: linear-gradient(to top, black 0% 50%, transparent 50% 100%);
    pointer-events: none;
  }
  .backdrop-edge {
    --thickness: 4px;
    position: absolute;
    inset: 0;
    height: 100%;
    transform: translateY(-100%);
    background: hsl(0deg 0% 100% / 0.1);
    backdrop-filter: blur(8px) brightness(180%) saturate(120%);
    mask-image: linear-gradient(
      to top,
      black 0,
      black var(--thickness),
      transparent var(--thickness)
    );
    pointer-events: none;
  }
</style>
