require 'bundler/inline'

gemfile do
  source 'https://rubygems.org'

  gem 'pry-byebug'
  gem 'ruby-prof'
end

require 'json'

class Simulator
  include Enumerable

  def initialize(data, box_count:, maximum_same_item_count:, repeat_count:)
    @data = data
    @box_count = box_count
    @maximum_same_item_count = maximum_same_item_count
    @repeat_count = repeat_count
  end

  def each(&block)
    items = @data.flat_map {|k, v| [k] * v }

    @repeat_count.times do
      items.shuffle!

      until box_index_ranges.all? {|box_range|
        items[box_range].tally.values.all? {|count| count <= @maximum_same_item_count }
      }
        items.shuffle!
      end

      block.call(box_index_ranges.map {|box_range| items[box_range] })
    end
  end

  private

  def total_items_count
    @total_items_count ||= @data.values.sum
  end

  def per_box
    @per_box ||= total_items_count.to_r / @box_count
  end

  def box_index_ranges
    @box_index_ranges ||= @box_count.times.map do |i|
      a = (i * per_box).floor
      b = ((i + 1) * per_box).floor
      a...b
    end
  end
end

N = 100000

count = nil

item_spawn = JSON.parse(File.read('data/item_spawn.json'))
data = item_spawn.select {|x| x['areaType'] == 'Temple' }.map {|x| [x['itemCode'], x['dropCount']] }.to_h
target_item = 401109

(1..15).each do |n|
  count = Simulator.new(data, box_count: 30, maximum_same_item_count: 2, repeat_count: N).count {|boxes|
    boxes[0, n].any? {|box| box.include?(target_item) }
  }
  p n
  p count / N.to_f
end

p target_item
# count = Simulator.new({a: 3, b: 4, c: 5}, box_count: 30, maximum_same_item_count: 2, repeat_count: N).count {|boxes|
#   boxes[0].include?(:a)
# }
