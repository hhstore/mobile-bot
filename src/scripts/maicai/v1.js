////////////////////////////////////////////////
//
// entry:
//
////////////////////////////////////////////////

//抢菜流程
function run() {
  // 解锁手机屏幕:
  unLockPhone();

  // 打开买菜 app:
  launchApp("美团买菜");
  waitForPackage("com.meituan.retail.v.android", 200);

  // 检查无障碍权限:
  auto.waitFor();

  //
  // app 跳过广告:
  //
  const btn_skip = id("btn_skip").findOne();
  if (btn_skip) {
    btn_skip.click();
    toast("已跳过首屏广告");
  }
  sleep(2000);

  // 购物车:
  openCartView();
  sleep(2000);

  // 检查:
  cartSelectAll();
  sleep(2000);

  //
  // 提交订单: 递归处理
  //
  clickView(0);
}

//
// start script:
//
run();

////////////////////////////////////////////////
//
// modules:
//
////////////////////////////////////////////////

// 解锁手机屏幕
function unLockPhone() {
  if (!device.isScreenOn()) {
    device.wakeUp();
    sleep(500);
    swipe(500, 2000, 500, 1000, 200);
    sleep(500);
    const password = "123456"; //这里换成自己的手机解锁密码
    for (let i = 0; i < password.length; i++) {
      let position = text(password[i]).findOne().bounds();
      click(position.centerX(), position.centerY());
      sleep(100);
    }
  }

  sleep(1000);
}

//打开购物车页面
function openCartView() {
  if (id("img_shopping_cart").exists()) {
    id("img_shopping_cart").findOne().parent().click();
    toast("已进入购物车");
  } else {
    toast("没找到购物车");
    exit;
  }
}

//勾选全部商品
function cartSelectAll() {
  const isCheckedAll = textStartsWith("结算(").exists();

  // todo x: button:
  const checkAllBtn = text("全选").findOne();
  if (!!checkAllBtn) {
    !isCheckedAll && checkAllBtn.parent().click();
    sleep(1000);
  } else {
    toast("没找到全选按钮");
    exit;
  }
}

//
// 提交订单:
//
function clickView(count) {
  var choices = ["", "", "", "", "", "", "", "", ""];

  //
  // 结算按钮:
  //
  if (textStartsWith("结算(").exists()) {
    //
    //
    //
    textStartsWith("结算(").findOne().parent().click();
  } else if (text("我知道了").exists()) {
    //
    //  todo x: key button
    //
    text("我知道了").findOne().parent().click();
    //
    toast("订单约满 >>  我知道了" + count);
  } else if (text("返回购物车").exists()) {
    text("返回购物车").findOne().parent().click();
    toast(">> 返回购物车");
  } else if (text("重新加载").exists()) {
    text("重新加载").findOne().parent().click();

    toast("重新加载: " + count);
  } else if (text("立即支付").exists()) {
    text("立即支付").findOne().parent().click();

    toast("立即支付: " + count);

    //
    //
    //
  } else if (text("确认支付").exists()) {
    const music =
      "/storage/emulated/0/netease/cloudmusic/Music/Joel Hanson Sara Groves - Traveling Light.mp3";
    media.playMusic(music);
    sleep(media.getMusicDuration());
  } else {
    // fix:
    // if (text("我知道了").exists()) {
    //   text("我知道了").findOne().parent().click();
    //   toast(">> 没抢到, 再接再厉!");
    //   exit;
    // }
    //
    //
    //
    toast(">> 抢个屁！" + count);
    exit;
  }

  // 重试统计:
  count = count + 1;
  //
  // 重试间隔::
  //
  sleep(500);

  // 结束执行: 退出:
  if (count > 10000) {
    toast(">> 没抢到, 结束执行", count);
    exit;
  }

  // 递归:
  clickView(count);
}

// 提交订单页面:
function isSubmitOrderView(appName) {
  var title = "提交订单";
  return className("android.widget.TextView").text(title).exists();
}

// 提交订单页面 - 返回按钮:
function clickSubmitOrderBackButton() {
  return className("android.view.ViewGroup")
    .clickable(true)
    .depth(12) // key
    .findOne()
    .click();
}
