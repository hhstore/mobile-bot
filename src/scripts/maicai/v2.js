////////////////////////////////////////////////
//
// entry:
//
////////////////////////////////////////////////

// 最大尝试次数:
var maxRetryNum = 10000;
// maxRetryNum = 10;

var appName = "美团买菜";
var appID = "com.meituan.retail.v.android";

// 点击间隔时间:
var clickTimeout = 500; // safe > 500

////////////////////////////////////////////////

//抢菜流程
function run() {
  // 解锁手机屏幕:
  unLockPhone();

  // 打开 app:
  launchApp(appName);
  waitForPackage(appID, 200);

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
  sleep(200);

  // 购物车:
  openCartView();
  sleep(500); // todo x: 必须设置较大参数, 否则无法全选

  // 检查:
  cartSelectAll();
  sleep(200);

  //
  // 提交订单: 递归处理
  //
  doTask();
  //   submitOrder(0);
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
// 批量检查+重试:
//
function doTask() {
  var count = 0;

  //
  while (true) {
    if (count > maxRetryNum) {
      toast("已达到最大抢菜次数: " + maxRetryNum);
      break;
    }

    // exec:
    clickView(count);
    count = count + 1;
  }
}

// 是否是购物车页面:
function isCartView() {
  var title = "购物车";
  return className("android.widget.TextView")
    .text(title)
    .findOne()
    .parent()
    .exists();
}

//
// 提交订单:
//
function clickView(count) {
  //
  // 重试间隔::
  //
  sleep(clickTimeout);

  //
  // 结算按钮:
  //
  if (textStartsWith("结算(").exists()) {
    textStartsWith("结算(").findOne().parent().click();
    // toast("click: " + count + "点击结算按钮");
  } else if (text("我知道了").exists()) {
    text("我知道了").findOne().parent().click();
    var has = isSubmitOrderView();
    toast("retry: " + count + " 订单已约满" + " >> 提交订单页: " + has);
  } else if (text("返回购物车").exists()) {
    text("返回购物车").findOne().parent().click();
    var has = isSubmitOrderView();
    toast("retry: " + count + " 返回购物车" + " >> 提交订单页: " + has);
  } else if (text("重新加载").exists()) {
    text("重新加载").findOne().parent().click();
    var has = isSubmitOrderView();
    toast("retry: " + count + " 重新加载" + " >> 提交订单页: " + has);
  } else if (text("立即支付").exists()) {
    text("立即支付").findOne().parent().click();
    var has = isSubmitOrderView();
    toast("retry: " + count + " 立即支付" + " >> 提交订单页: " + has);
  } else if (text("确认支付").exists()) {
    const music =
      "/storage/emulated/0/netease/cloudmusic/Music/Joel Hanson Sara Groves - Traveling Light.mp3";
    media.playMusic(music);

    //
    sleep(media.getMusicDuration());

    var has = isSubmitOrderView();
    toast("ok: " + count + " 确认支付" + " >> 提交订单页: " + has);
  }
}

// 提交订单页面:
function isSubmitOrderView() {
  var title = "提交订单";
  var ok = className("android.widget.TextView").text(title).exists();
  //   toast("提交订单页面: " + ok);
  return ok;
}

// 提交订单页面 - 返回按钮:
function clickSubmitOrderBackButton() {
  return className("android.view.ViewGroup")
    .clickable(true)
    .depth(12) // key
    .findOne()
    .click();
}
