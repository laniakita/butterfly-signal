use crate::utils::set_panic_hook;
use web_sys::console;

pub fn to_mini_profile() {
  // init our panic hook
  set_panic_hook();

  console::log_1(&"pretending to create mini profile from data.".into());
}