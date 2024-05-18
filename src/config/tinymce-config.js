const DEFAULT_CONFIG = {
    language: 'zh_CN',
    skin: 'tinymce-5',
    branding: false,
    menubar: false,
    plugins: 'preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media code codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount emoticons autosave autoresize',
    toolbar: [
        'styles fontfamily fontsize alignleft aligncenter alignright alignjustify forecolor backcolor bold italic underline strikethrough link image',
        'outdent indent bullist numlist blockquote subscript superscript removeformat table charmap emoticons hr preview',
    ],
    min_height: 320,
    max_height: 320,
    width: '100%',
    font_family_formats: '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;',
    link_list: [
        { title: 'clboy', value: 'https://www.clboy.cn' },
    ],
    image_list: [],
    importcss_append: true,
    file_picker_callback: function (callback, value, meta) {
        alert('hhhh');
    },
    autosave_ask_before_unload: false,
};
export default function initTinymceConfig(config) {
    return Object.assign({}, DEFAULT_CONFIG, config || {});
}