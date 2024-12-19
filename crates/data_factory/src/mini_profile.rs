use wasm_bindgen::prelude::*;
use crate::utils::set_panic_hook;
use web_sys::js_sys::{self, JsString, Object, Reflect};

#[wasm_bindgen]
pub fn to_mini_profile(profile_data: JsValue) -> JsValue {
  // init our panic hook
  set_panic_hook();

  //console::log_1(&"creating mini bsky profile from data.".into());
  
  let data_keys = [
    "avatar",
    "banner",
    "description",
    "displayName",
    "handle"
  ];

  fn is_empty(val: &JsValue) -> bool {
    val.is_string() && val.as_string().map_or(true, |s| s.is_empty()) || val.is_null() || val.is_undefined()
  }

  let mut data_vals = data_keys.iter()
    .map(|&key| {
      let val_raw = Reflect::get(&profile_data, &JsValue::from_str(key)).unwrap_or(JsValue::NULL);
      
      let val = if is_empty(&val_raw) {
        JsValue::NULL
      } else {
        val_raw
      };

      (key, val)
    }).collect::<Vec<_>>();
  
  if let Some((_, handle_res)) = data_vals.iter().find(|(key, _)| *key == "handle") {
    let url_res = JsString::concat(&JsString::from("https://bsky.app/profile/"), handle_res);
    data_vals.push(("url", url_res.into()));
  }
  data_vals.push(("updated", js_sys::Date::new_0().into()));

  let mini_profile = Object::new();
  for (key, val) in data_vals {
    Reflect::set(&mini_profile, &JsValue::from_str(key), &val).unwrap();
  }

  //console::log_1(&"Done!".into());

  mini_profile.into()

}