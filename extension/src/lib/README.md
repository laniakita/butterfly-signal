# Order of Operations

## 1. Build query Key

- Get URL from current/active tab -> URL
- Generate hostname from returned URL -> hostname

## 2. Query local storage

- Query local storage using the hostname as a key -> cached data
- If cached data exists, and isn't stale -> Cached MiniProfile
- In all other cases, fetch/save/update data into local stage -> MiniProfile
  - I. Use returned hostname to query for a
    TXT record on _atproto.hostname -> Response
  - II. If the query returns an 'Answer', instead of
    'Authority' (such as in the null case), fetch
    profile info from <https://public.api.bsky.app>
    using the hostname as a profile handle. Then
    build a MiniProfile object -> MiniProfile

## 3. From returned profile, handle icon update

- if the returned Promise is a valid MiniProfile, icon set active
- if the returned promis is a 'null' MiniProfile, icon set inactive
