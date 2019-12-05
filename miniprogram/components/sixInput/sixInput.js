// component.js
Component({

  properties: {

    //输入框密码位数
    value_length: {
      type: Number,
      value: 0,
      observer: function (newVal, oldVal) {
        let input_value = this.data.input_value
        if (newVal == 6) {
          setTimeout(() => {
            this.triggerEvent('valueSix', input_value)
          }, 100)
        }
      }
    },

    // 是否显示间隔输入框
    interval: {
      type: Boolean,
      value: true,
    },

    clear:{
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {
        this.setData({
          get_focus: true,
          value_length: 0,
          input_value: "",
          shake: true
        });
        setTimeout(() => {
          this.setData({
            shake: false
          });
        }, 1000)
      }
    },

    //输入框聚焦状态
    get_focus: {
      type: Boolean,
      value: false,
    },
    //输入框初始内容
    input_value: {
      type: String,
      value: "",
    },
    //输入框格子数
    value_num: {
      type: Array,
      value: [1, 2, 3, 4, 5, 6]
    },
    //输入框高度
    height: {
      type: String,
      value: "100rpx",
    },
    //输入框宽度
    width: {
      type: String,
      value: "614rpx",
    },
    //是否明文展示
    see: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    shake: false
  },

  methods: {

    focus() {
      this.setData({
        get_focus: true
      })
    },

    blur() {
      this.setData({
        get_focus: false
      })
    },

    set_focus() {
      this.setData({
        get_focus: true
      })
    },

    get_value(data) {
      // 设置空数组用于明文展现
      let val_arr = [];
      // 获取当前输入框的值
      let now_val = data.detail.value
      // 遍历把每个数字加入数组
      for (let i = 0; i < 6; i++) {
        val_arr.push(now_val.substr(i, 1))
      }
      let value_length = data.detail.value.length;
      this.setData({
        value_length: value_length,
        val_arr: val_arr,
        input_value: now_val
      });

    },
  }
})
