<script lang="ts">
  import { nullMiniProfile, type MiniProfile } from "./lib/bsky/utils";
  import { keyFromTab } from "./lib/dns";
  import { mainHandler } from "./lib/handlers";

  let title = $state("No Bsky profile detected.");
  let miniProfileData: MiniProfile = $state(nullMiniProfile);
  let shouldDisplayProfile = $state(false);

  $effect(() => {
    (async () => {
      miniProfileData = (await mainHandler()) ?? nullMiniProfile;
      if (miniProfileData.handle !== null) {
        title = miniProfileData.handle;
        shouldDisplayProfile = true;
      } else {
        const hostname = await keyFromTab();
        title = `${hostname} doesn't have a profile on bsky.app`;
        shouldDisplayProfile = false;
      }
    })();
  });
</script>

<main
  class="w-[20rem] min-h-[30rem] bg-slate-950 text-slate-300 flex flex-col justify-start items-center"
>
  {#if shouldDisplayProfile && miniProfileData.banner !== null}
    <div class="">
      <img
        src={miniProfileData.banner}
        alt="{miniProfileData.displayName ?? miniProfileData.handle}'s banner"
        class="w-full h-56 object-cover"
      />
    </div>
  {/if}

  {#if shouldDisplayProfile}
    <div class="px-14 pb-14 {miniProfileData.banner ? '-mt-10' : 'pt-14'} {miniProfileData.description === null ? 'flex flex-col justify-center items-center' : ''}">
      <img
        src={miniProfileData.avatar}
        alt="{miniProfileData.displayName ?? miniProfileData.handle} profile"
        class="w-20 h-20 rounded-full border-2 border-slate-300"
      />
      <h1 class="text-3xl">{miniProfileData.displayName}</h1>
      <h2 class="text-lg {!miniProfileData.displayName && 'mt-2'}">@{miniProfileData.handle}</h2>
      <p>{miniProfileData.description}</p>
      <button class="bg-blue-500 rounded-full w-full min-h-10 py-2 border border-blue-300 hover:border-blue-800 text-center mt-10 font-mono font-semibold hover:bg-blue-300 hover:text-blue-800 px-4 text-balance">
        follow <span class="whitespace-nowrap">{miniProfileData.displayName ?? miniProfileData.handle}</span> on bluesky
      </button>
    </div>
  {:else}
    <div class="p-20">
      <h3 class="text-lg">{title}</h3>
    </div>
  {/if}
</main>
