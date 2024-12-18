use wasm_bindgen::prelude::*;
use crate::utils::set_panic_hook;
use web_sys::console;

#[wasm_bindgen]
pub fn to_mini_profile(profile_data: JsValue) {
  // init our panic hook
  set_panic_hook();

  console::log_1(&"pretending to create mini profile from data.".into());
  console::log_1(&profile_data);
}